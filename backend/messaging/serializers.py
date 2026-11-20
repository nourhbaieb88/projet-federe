from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages"""
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_from_me = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_name', 'sender_username', 'content',
            'is_read', 'is_from_me', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at']
    
    def get_is_from_me(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.sender == request.user
        return False


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations"""
    establishment_name = serializers.CharField(
        source='establishment.name', read_only=True
    )
    client_name = serializers.CharField(
        source='client.get_full_name', read_only=True
    )
    client_username = serializers.CharField(
        source='client.username', read_only=True
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'client', 'client_name', 'client_username', 'establishment',
            'establishment_name', 'last_message', 'unread_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return MessageSerializer(last_msg, context=self.context).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if request.user.user_type == 'client':
                return obj.messages.filter(
                    sender__user_type='establishment',
                    is_read=False
                ).count()
            elif request.user.user_type == 'establishment':
                return obj.messages.filter(
                    sender__user_type='client',
                    is_read=False
                ).count()
        return 0


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating conversations"""
    
    class Meta:
        model = Conversation
        fields = ['id', 'establishment']
        read_only_fields = ['id']
    
    def validate_establishment(self, value):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if request.user.user_type != 'client':
                raise serializers.ValidationError(
                    "Only clients can start a conversation."
                )

            # Check if user already has a conversation with this establishment
            existing_conversation = Conversation.objects.filter(
                client=request.user,
                establishment=value
            ).exists()
            
            if existing_conversation:
                raise serializers.ValidationError(
                    "You already have a conversation with this establishment."
                )
            
            # Check that user is not the establishment owner
            if request.user == value.owner:
                raise serializers.ValidationError(
                    "You cannot start a conversation with your own establishment."
                )
        
        return value
    
    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        return ConversationSerializer(instance, context=self.context).data


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    
    class Meta:
        model = Message
        fields = ['content']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return value
    
    def create(self, validated_data):
        conversation_id = self.context['conversation_id']
        conversation = Conversation.objects.get(id=conversation_id)
        
        # Determine sender based on user type
        request = self.context['request']
        if request.user.user_type == 'client':
            if conversation.client != request.user:
                raise serializers.ValidationError(
                    "You can only send messages in your own conversations."
                )
        elif request.user.user_type == 'establishment':
            if conversation.establishment.owner != request.user:
                raise serializers.ValidationError(
                    "You can only send messages in conversations with your establishments."
                )
        
        validated_data['sender'] = request.user
        validated_data['conversation'] = conversation
        
        return super().create(validated_data)

    def to_representation(self, instance):
        return MessageSerializer(instance, context=self.context).data

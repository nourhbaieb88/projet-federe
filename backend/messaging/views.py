from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer
)
from accounts.permissions import IsClient, IsEstablishmentOwner


class ConversationListCreateView(generics.ListCreateAPIView):
    """List conversations for current user or create a new conversation"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            return Conversation.objects.filter(client=user)
        elif user.user_type == 'establishment':
            return Conversation.objects.filter(establishment__owner=user)
        else:
            return Conversation.objects.none()


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """Retrieve or delete a conversation"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'client':
            return Conversation.objects.filter(client=user)
        elif user.user_type == 'establishment':
            return Conversation.objects.filter(establishment__owner=user)
        else:
            return Conversation.objects.none()


class MessageListCreateView(generics.ListCreateAPIView):
    """List messages in a conversation or create a new message"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if user has access to this conversation
        user = self.request.user
        has_access = (
            (user.user_type == 'client' and conversation.client == user) or
            (user.user_type == 'establishment' and conversation.establishment.owner == user)
        )
        
        if not has_access:
            return Message.objects.none()
        
        return Message.objects.filter(conversation=conversation)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['conversation_id'] = self.kwargs['conversation_id']
        return context
    
    def perform_create(self, serializer):
        message = serializer.save()
        
        # Mark messages as read for the sender
        # (messages are automatically unread for the recipient)
        pass


class MessageDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a message (mark as read)"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if user has access to this conversation
        user = self.request.user
        has_access = (
            (user.user_type == 'client' and conversation.client == user) or
            (user.user_type == 'establishment' and conversation.establishment.owner == user)
        )
        
        if not has_access:
            return Message.objects.none()
        
        return Message.objects.filter(conversation=conversation)
    
    def perform_update(self, serializer):
        # Only allow marking messages as read
        if 'is_read' in self.request.data and self.request.data['is_read'] == True:
            # Only recipient can mark message as read
            message = self.get_object()
            user = self.request.user
            
            if user.user_type == 'client' and message.sender.user_type == 'establishment':
                serializer.save(is_read=True)
            elif user.user_type == 'establishment' and message.sender.user_type == 'client':
                serializer.save(is_read=True)
            else:
                raise serializers.ValidationError(
                    "You can only mark received messages as read."
                )
        else:
            raise serializers.ValidationError(
                "Only marking messages as read is allowed."
            )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_conversation_read(request, conversation_id):
    """Mark all messages in a conversation as read for current user"""
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Check if user has access to this conversation
    user = request.user
    has_access = (
        (user.user_type == 'client' and conversation.client == user) or
        (user.user_type == 'establishment' and conversation.establishment.owner == user)
    )
    
    if not has_access:
        return Response(
            {'error': 'You do not have access to this conversation.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Mark messages as read based on user type
    if user.user_type == 'client':
        # Client marks establishment messages as read
        Message.objects.filter(
            conversation=conversation,
            sender__user_type='establishment',
            is_read=False
        ).update(is_read=True)
    elif user.user_type == 'establishment':
        # Establishment owner marks client messages as read
        Message.objects.filter(
            conversation=conversation,
            sender__user_type='client',
            is_read=False
        ).update(is_read=True)
    
    return Response({'status': 'Messages marked as read.'})

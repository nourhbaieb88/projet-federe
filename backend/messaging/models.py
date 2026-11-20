from django.db import models
from accounts.models import User
from establishments.models import Establishment


class Conversation(models.Model):
    """Model for conversations between clients and establishments"""
    
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name="Établissement"
    )
    
    client = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name="Client"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        unique_together = ['establishment', 'client']
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation entre {self.client.username} et {self.establishment.name}"


class Message(models.Model):
    """Model for messages in conversations"""
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Conversation"
    )
    
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name="Expéditeur"
    )
    
    content = models.TextField(
        verbose_name="Contenu"
    )
    
    is_read = models.BooleanField(
        default=False,
        verbose_name="Lu"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message de {self.sender.username} à {self.created_at}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update conversation timestamp
        self.conversation.updated_at = self.created_at
        self.conversation.save(update_fields=['updated_at'])

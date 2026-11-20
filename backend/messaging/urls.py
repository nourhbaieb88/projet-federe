from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    
    # Messages within conversations
    path('conversations/<int:conversation_id>/messages/', 
         views.MessageListCreateView.as_view(), name='message-list-create'),
    path('conversations/<int:conversation_id>/messages/<int:pk>/', 
         views.MessageDetailView.as_view(), name='message-detail'),
    
    # Utility endpoints
    path('conversations/<int:conversation_id>/mark-read/', 
         views.mark_conversation_read, name='mark-conversation-read'),
]
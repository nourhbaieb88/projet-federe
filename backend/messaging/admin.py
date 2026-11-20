from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "establishment", "client", "updated_at", "created_at")
    list_filter = ("created_at", "updated_at")
    search_fields = (
        "establishment__name",
        "client__username",
        "client__email",
    )
    ordering = ("-updated_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "sender", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = (
        "conversation__establishment__name",
        "conversation__client__username",
        "sender__username",
        "content",
    )
    ordering = ("-created_at",)

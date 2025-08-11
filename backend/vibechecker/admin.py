from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Sentiment140Item

# Register your custom models
@admin.register(Sentiment140Item)
class Sentiment140ItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'text', 'target', 'date', 'owner']
    list_filter = ['target', 'date', 'owner']
    search_fields = ['user', 'text']
    readonly_fields = ['date']
    
    # Allow admins to change the owner
    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return ['date']
        return ['date', 'owner']

# Customize User admin (optional)
class CustomUserAdmin(BaseUserAdmin):
    # Add any custom fields or behavior here
    list_display = BaseUserAdmin.list_display + ('date_joined',)
    
# Unregister the default User admin and register the custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
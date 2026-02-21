from rest_framework import generics, permissions, serializers
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from django.contrib.auth.models import User, Group

# from oauth2_provider.views.generic import ProtectedResourceView
# from django.http import HttpResponse
# from django.contrib.auth.decorators import login_required

# @login_required() # checks if the request.user.is_authenticated is true of false
#request.user comes from the settings auth backends
    # AUTHENTICATION_BACKENDS = [
    #     'oauth2_provider.backends.OAuth2Backend',
    #     # Uncomment following if you want to access the admin
    #     'django.contrib.auth.backends.ModelBackend',]
#if a request has a Bearer token OAuth 2.0 handles it
#else modelBackend looks up users by username/password
#default django auth doesnt work if the ModelBackend isnt listed
# def secret_page(request, *args, **kwargs):
#     return HttpResponse('Secret contents!', status=200)

# class ApiEndpoint(ProtectedResourceView):
#     def get(self, request, *args, **kwargs):
#         return HttpResponse('Hello, OAuth2!')

    
# first we define the serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', "first_name", "last_name")

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("name", )

# Create the API views
class UserList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetails(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GroupList(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['groups']
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

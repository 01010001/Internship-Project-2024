from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import generics
from . import models
from . import serializers
from rest_framework import generics
from .models import Developers, Projects, Teams, WorkingOn
from .serializers import DeveloperSerializer, ProjectSerializer, TeamSerializer, WorkingOnSerializer

# class DeveloperCreateAPIView(generics.ListCreateAPIView):
#     queryset = models.Developers.objects.all()
#     serializer_class = serializers.DeveloperSerializer

# @api_view(['GET'])
# def getData(request):
#     items = models.Developers.objects.all()
#     serializer = serializers.DeveloperSerializer(items, many=True)
#     return Response(serializer.data)

# @api_view(['POST'])
# def addData(request):
#     serializer = serializers.DeveloperSerializer(data=request.data)
#     if serializer.is_valid():
#         print("its valid, saving")
#         serializer.save()
#     else:
#         print("not valid", serializer.errors)
#     return Response(serializer.data)

# #deletion of certain developer rows on demand.
# @api_view(['DELETE'])
# def removeData(request, id):
# #     instance = models.Developers.objects.get(id=id)
# #     instance.delete()
# #     return Response()
#     pass

# from django.contrib.auth.decorators import login_required
# this only works for function based views
# @login_required()


from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope
#to use DOT authentication in DRF generic views use this method
# permission_classes = [TokenHasReadWriteScope]

class DeveloperListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Developers.objects.all()
    serializer_class = DeveloperSerializer

class DeveloperRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Developers.objects.all()
    serializer_class = DeveloperSerializer

class ProjectListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Projects.objects.all()
    serializer_class = ProjectSerializer

class ProjectRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Projects.objects.all()
    serializer_class = ProjectSerializer

class TeamListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Teams.objects.all()
    serializer_class = TeamSerializer

class TeamRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = Teams.objects.all()
    serializer_class = TeamSerializer

class WorkingOnListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = WorkingOn.objects.all()
    serializer_class = WorkingOnSerializer

class WorkingOnRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [TokenHasReadWriteScope]
    queryset = WorkingOn.objects.all()
    serializer_class = WorkingOnSerializer



#############################################################################

from oauth2_provider.views.generic import ProtectedResourceView
from django.http import HttpResponse

class ApiEndpoint(ProtectedResourceView):
    def get(self, request, *args, **kwargs):
        return HttpResponse('Hello, OAuth2!')
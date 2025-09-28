from django.urls import path
from .views import (
    DeveloperListCreateAPIView,
    DeveloperRetrieveUpdateAPIView,
    ProjectListCreateAPIView,
    ProjectRetrieveUpdateAPIView,
    TeamListCreateAPIView,
    TeamRetrieveUpdateAPIView,
    WorkingOnListCreateAPIView,
    WorkingOnRetrieveUpdateAPIView,
)

from django.urls import path, include
from oauth2_provider import urls as oauth2_urls

import oauth2_provider.views as oauth2_views
from django.conf import settings
from .views import ApiEndpoint

# OAuth2 provider endpoints
oauth2_endpoint_views = [
    path('authorize/', oauth2_views.AuthorizationView.as_view(), name="authorize"),
    path('token/', oauth2_views.TokenView.as_view(), name="token"),
    path('revoke-token/', oauth2_views.RevokeTokenView.as_view(), name="revoke-token"),
]

if settings.DEBUG:
    # OAuth2 Application Management endpoints
    oauth2_endpoint_views += [
        path('applications/', oauth2_views.ApplicationList.as_view(), name="list"),
        path('applications/register/', oauth2_views.ApplicationRegistration.as_view(), name="register"),
        path('applications/<pk>/', oauth2_views.ApplicationDetail.as_view(), name="detail"),
        path('applications/<pk>/delete/', oauth2_views.ApplicationDelete.as_view(), name="delete"),
        path('applications/<pk>/update/', oauth2_views.ApplicationUpdate.as_view(), name="update"),
    ]

    # OAuth2 Token Management endpoints
    oauth2_endpoint_views += [
        path('authorized-tokens/', oauth2_views.AuthorizedTokensListView.as_view(), name="authorized-token-list"),
        path('authorized-tokens/<pk>/delete/', oauth2_views.AuthorizedTokenDeleteView.as_view(),
            name="authorized-token-delete"),
    ]


urlpatterns = [
    
    path('o/', include((oauth2_endpoint_views, 'oauth2_provider'), namespace="oauth2_provider")),
    path('api/hello', ApiEndpoint.as_view()),  # an example resource endpoint


    path('developers/', DeveloperListCreateAPIView.as_view(), name='developer-list-create'),
    path('developers/<int:pk>/', DeveloperRetrieveUpdateAPIView.as_view(), name='developer-retrieve-update'),
    path('projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('projects/<int:pk>/', ProjectRetrieveUpdateAPIView.as_view(), name='project-retrieve-update'),
    path('teams/', TeamListCreateAPIView.as_view(), name='team-list-create'),
    path('teams/<int:pk>/', TeamRetrieveUpdateAPIView.as_view(), name='team-retrieve-update'),
    path('working-on/', WorkingOnListCreateAPIView.as_view(), name='workingon-list-create'),
    path('working-on/<int:pk>/', WorkingOnRetrieveUpdateAPIView.as_view(), name='workingon-retrieve-update'),
]

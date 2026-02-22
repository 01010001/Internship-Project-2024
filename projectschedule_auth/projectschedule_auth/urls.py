from django.urls import path, include, re_path

from django.contrib import admin
admin.autodiscover()

from oauth2_provider import urls as oauth2_urls

import oauth2_provider.views as oauth2_views
from django.conf import settings
from .views import UserList, UserDetails, GroupList


# OAuth2 provider endpoints
oauth2_endpoint_views = [
    path('authorize/', oauth2_views.AuthorizationView.as_view(), name="authorize"),
    path('token/', oauth2_views.TokenView.as_view(), name="token"),
    path('revoke-token/', oauth2_views.RevokeTokenView.as_view(), name="revoke-token"),
    path('introspect/', oauth2_views.IntrospectTokenView.as_view(), name="introspection"),

    # OpenID Connect endpoints
    path('.well-known/openid-configuration', oauth2_views.ConnectDiscoveryInfoView.as_view(), name="oidc-connect-discovery-info"),
    path('.well-known/jwks.json', oauth2_views.JwksInfoView.as_view(), name="jwks-info"),
    path('userinfo/', oauth2_views.UserInfoView.as_view(), name="user-info"),

    path('logout/', oauth2_views.RPInitiatedLogoutView.as_view(), name="rp-initiated-logout"),
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
    # OAuth 2 endpoints:
    # need to pass in a tuple of the endpoints as well as the app's name
    # because the app_name attribute is not set in the included module
    path('o/', include((oauth2_endpoint_views, 'oauth2_provider'), namespace="oauth2_provider")),
    path('admin/', admin.site.urls),
    path('users/', UserList.as_view()),
    path('users/<pk>/', UserDetails.as_view()),
    path('groups/', GroupList.as_view()),
]
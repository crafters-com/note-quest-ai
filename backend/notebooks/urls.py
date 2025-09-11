from rest_framework import routers
from notebooks.views import NotebookViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'notebooks', NotebookViewSet, basename='notebook')

urlpatterns = [
    # ...
    path('api/', include(router.urls)),
]

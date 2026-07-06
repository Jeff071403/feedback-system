from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from feedback.models import Feedback
from feedback.serializers import FeedbackSerializer
from feedback.initial_data import initial_feedbacks

class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def get_queryset(self):
        # Dynamically auto-populate with initial mock data if database table is empty
        if not Feedback.objects.exists():
            for item in initial_feedbacks:
                Feedback.objects.create(**item)
        return Feedback.objects.all()

    @action(detail=False, methods=['post'])
    def reset(self, request):
        # Clear and repopulate database
        Feedback.objects.all().delete()
        for item in initial_feedbacks:
            Feedback.objects.create(**item)
        # Fetch the updated list
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


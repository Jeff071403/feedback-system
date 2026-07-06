from rest_framework import serializers
from feedback.models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    digitalToolHelp = serializers.CharField(source='digital_tool_help', required=False, allow_blank=True)
    digitalToolTypes = serializers.JSONField(source='digital_tool_types', required=False, default=list)
    userGroup = serializers.CharField(source='user_group', required=False, allow_blank=True)
    solution = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = [
            'id', 'timestamp', 'problems', 'frequency', 'affected',
            'digitalToolHelp', 'digitalToolTypes', 'userGroup',
            'description', 'priority', 'status', 'solution',
            'name', 'department'
        ]

    def get_id(self, obj):
        # Format the auto ID as "fb-{id}" to match the frontend expectations
        return f"fb-{obj.id}"

    def get_solution(self, obj):
        # Format nested solution structure or return None
        if not obj.solution_name:
            return None
        return {
            'name': obj.solution_name,
            'type': obj.solution_type,
            'status': obj.solution_status,
            'description': obj.solution_description
        }

    def update(self, instance, validated_data):
        # Handle nested solution updates since it's a read-only SerializerMethodField
        solution_data = self.initial_data.get('solution')
        if solution_data is not None:
            if solution_data == '' or solution_data is None:
                instance.solution_name = None
                instance.solution_type = None
                instance.solution_status = None
                instance.solution_description = None
            elif isinstance(solution_data, dict):
                instance.solution_name = solution_data.get('name', instance.solution_name)
                instance.solution_type = solution_data.get('type', instance.solution_type)
                instance.solution_status = solution_data.get('status', instance.solution_status)
                instance.solution_description = solution_data.get('description', instance.solution_description)
        
        # Call standard updates for model fields
        return super().update(instance, validated_data)

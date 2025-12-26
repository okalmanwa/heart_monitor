# Generated manually

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('insights', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInsightSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('summary_text', models.TextField(help_text='The AI-generated summary of insights')),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('insight_count', models.IntegerField(default=0, help_text='Number of insights used to generate this summary')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='insight_summary', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
                'verbose_name_plural': 'User Insight Summaries',
            },
        ),
    ]



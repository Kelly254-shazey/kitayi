from django.db import migrations, models


NEW_ROLE_NAMES = [
    'Industrial Customer',
    'Cashier',
    'Branch Manager',
    'System Administrator',
]


def create_missing_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    for role in NEW_ROLE_NAMES:
        Group.objects.get_or_create(name=role)


def remove_added_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=NEW_ROLE_NAMES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_create_roles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='user_type',
            field=models.CharField(
                choices=[
                    ('Residential', 'Residential'),
                    ('Commercial', 'Commercial'),
                    ('Industrial', 'Industrial'),
                    ('Cashier', 'Cashier'),
                    ('Branch Manager', 'Branch Manager'),
                    ('System Administrator', 'System Administrator'),
                    ('Driver', 'Driver'),
                    ('Warehouse Staff', 'Warehouse Staff'),
                    ('Customer Support', 'Customer Support'),
                    ('Auditor', 'Auditor'),
                ],
                default='Residential',
                max_length=30,
            ),
        ),
        migrations.RunPython(create_missing_roles, remove_added_roles),
    ]

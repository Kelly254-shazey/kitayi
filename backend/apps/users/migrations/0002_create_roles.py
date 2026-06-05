from django.db import migrations


def create_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    roles = [
        'Super Admin',
        'Operations Manager',
        'Finance Manager',
        'Customer Support',
        'Driver',
        'Warehouse Staff',
        'Residential Customer',
        'Corporate Customer',
        'Auditor',
    ]
    for role in roles:
        Group.objects.get_or_create(name=role)


def delete_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    roles = [
        'Super Admin',
        'Operations Manager',
        'Finance Manager',
        'Customer Support',
        'Driver',
        'Warehouse Staff',
        'Residential Customer',
        'Corporate Customer',
        'Auditor',
    ]
    Group.objects.filter(name__in=roles).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_roles, delete_roles),
    ]

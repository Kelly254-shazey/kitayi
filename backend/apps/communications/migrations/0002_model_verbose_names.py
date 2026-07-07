from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('communications', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='contactinquiry',
            options={
                'verbose_name': 'contact inquiry',
                'verbose_name_plural': 'contact inquiries',
            },
        ),
        migrations.AlterModelOptions(
            name='newslettersubscriber',
            options={
                'verbose_name': 'newsletter subscriber',
                'verbose_name_plural': 'newsletter subscribers',
            },
        ),
    ]

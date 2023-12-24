from django import template

register = template.Library()


@register.inclusion_tag('components/_recorder.html')
def render_recorder(aria_max, rec_class=None):
    aria_max = int(aria_max)
    if aria_max % 60 > 0:
        sec = 60 / (aria_max % 60) + 1
        min = (aria_max / 60) // 1

        if sec >= 60:
            min = min + 1
            sec = 0

        max_time = f'{("%02d" % min)}:{"%02d" % sec}'
    else:
        max_time = f'{("%02d" % (aria_max / 60))}:00'

    return {'aria_max': aria_max, 'max_time': max_time, 'class': rec_class}

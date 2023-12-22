let time_out = undefined
const recording = function() {
    let triggers = $('.recording'),
        options = $(triggers.siblings('.options')),
        chronometer_current = $(options.find('.chronometers .chronometer-current span')),
        current = chronometer_current.text(),
        minutes = parseInt(current.split(':')[0]),
        seconds = parseInt(current.split(':')[1]),
        max = parseInt(triggers.attr('aria-max'))

    let info = calc_time(minutes, seconds, max),
        acc = info[2],
        perc = info[3]

    minutes = info[0]
    seconds = info[1]

    current = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')
    chronometer_current.html(acc == max ? '03:00' : current)
    $(options.find('.progress .determinate')).css('width', `${perc}%`)

    if (acc == max)
        clear_interval(triggers)
},
clear_interval = function (triggers) {
    triggers.removeClass('recording')
    clearInterval(time_out)
    $(triggers.find('.btn-stop')).addClass('d-none')
    $(triggers.find('.btn-record')).removeClass('d-none').attr('disabled', 'true')

    if (triggers.parents('#response-voice').length > 0) {
        //henrique response
    } else {
        $('#spinner').removeClass('d-none')

        //henrique fetch then
        $('#spinner').addClass('d-none')
        $('#response-voice').removeClass('d-none')

        let options = $(triggers.siblings('.options')),
            chronometer_current = $(options.find('.chronometer-current span'))

        $(options.find('.chronometer-max span')).html(chronometer_current.text())
        triggers.attr('aria-max', time_to_decimal(chronometer_current.text()))
        chronometer_current.html('00:00')
        $(options.find('.progress .determinate')).css('width', '0%')
        //henrique request colocar o audio gravado para reproduzir
    }
},
calc_time = function (minutes, seconds, max) {
    minutes = seconds <= 59 ? minutes : minutes + 1
    seconds = seconds < 60 ? seconds + 1 : 0
    let acc = minutes * 60 + seconds,
        perc = (acc * 100) / max

    return [minutes, seconds, acc, perc]
},
time_to_decimal = function (timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const decimalValue = hours + minutes / 60;

  return decimalValue;
}

$('.btn-record').on('click', function () {
    let recorder = $(this),
        stop = $(recorder.siblings('.btn-stop')),
        triggers = $(recorder.parents('.triggers')),
        options = $(triggers.siblings('.options')),
        chronometers = $(options.find('.chronometers')),
        card = $(recorder.parents('.card-panel'))

    recorder.addClass('d-none')
    stop.removeClass('d-none')

    triggers.addClass('recording')
    options.removeClass('flex-0').addClass('flex-2 px-3')
    chronometers.removeClass('d-none').addClass('d-flex')

    card.removeClass('w-auto').addClass('w-100')

    time_out = setInterval(recording, 1000)
})

$('.btn-stop').on('click', function () {
    clear_interval($($(this).parents('.triggers')))
})

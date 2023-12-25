import {
    calc_time,
    time_to_decimal,
    decimal_to_seconds,
    time_to_text
} from '../general_functions.js'

export default class Recorder {
    constructor(element) {
        this.interval = undefined
        this.element = element
        this.stream = undefined
        this.max_seconds = 180
        this.media_recorder = undefined
        this.chunks = []
    }

    start() {
        this.prepare_card()
        this.interval = setInterval(() => { this.chronometer_run_progress() }, 1000)
    }

    stop() {
        this.clear_interval()
    }

    prepare_card() {
        if (!this.element.hasClass('opened'))
            this.element.addClass('opened')

        let recorder = $(this.element.find('.btn-record')),
            stop = $(recorder.siblings('.btn-stop'))

        recorder.addClass('d-none')
        stop.removeClass('d-none')
    }

    set_interval(run = undefined) {
        this.chronometer_run_progress(run)
    }

    chronometer_run_progress(run = undefined) {
        let triggers = $(this.element.find('.triggers')),
            options = $(triggers.siblings('.options')),
            chronometer_current = $(options.find('.chronometers .chronometer-current span')),
            current = chronometer_current.text(),
            minutes = parseInt(current.split(':')[0]),
            seconds = parseInt(current.split(':')[1]),
            max = parseInt(triggers.attr('aria-max'))

        let info = calc_time(minutes, seconds, max),
            acc = info.acc,
            perc = info.perc

        minutes = info.minutes
        seconds = info.seconds

        current = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0')

        if (run !== undefined)
            run()

        if (this.media_recorder && this.media_recorder.state !== 'recording')
            this.media_recorder.start()

        chronometer_current.html(acc == max ? time_to_text(max) : current)
        $(options.find('.progress .determinate')).css('width', `${perc}%`)

        if (acc == max)
            this.stop()
    }

    chronometer_stop_progress() {
        let triggers = $(this.element.find('.triggers')),
            options = $(triggers.siblings('.options')),
            chronometer_current = $(options.find('.chronometer-current span'))

        $(triggers.find('.btn-stop')).addClass('d-none')
        $(triggers.find('.btn-record')).removeClass('d-none')

        this.max_seconds = decimal_to_seconds(time_to_decimal(chronometer_current.text()))
        if (!this.element.hasClass('recorded')) {
            $('#spinner').removeClass('d-none')
            $(options.find('.chronometer-max span')).html(chronometer_current.text())
            triggers.attr('aria-max', this.max_seconds)
            $(triggers.find('.btn-record')).attr('disabled', 'true')
        }

        chronometer_current.html('00:00')
        $(options.find('.progress .determinate')).css('width', '0%')
    }

    clear_interval(run = undefined) {
        this.chronometer_stop_progress()

        if (run !== undefined)
            run()
        else
            clearInterval(this.interval)
    }

    set_media_recorder() {
        this.media_recorder = new MediaRecorder(this.stream)

        this.media_recorder.ondataavailable = (event) => {
            if (event.data.size > 0)
                this.chunks.push(event.data)
        }

        this.media_recorder.onstop = () => {
            this.blob = new Blob(this.chunks, { type: 'audio/mp3;' })
            $(this.element.find('audio'))[0].src = window.URL.createObjectURL(this.blob)

            const reader = new FileReader()
            reader.onloadend = () => {
                fetch('whisper/', {
                    method: 'POST',
                    body: JSON.stringify({
                        data: reader.result.split(',')[1]
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Upload bem-sucedido:', data)

                    $('#spinner').addClass('d-none')
                    $('#response-voice').removeClass('d-none')
                    this.element.addClass('recorded')
                    $(this.element.find('.btn-record')).removeAttr('disabled')
                })
                .catch(error => {
                    console.error('Erro no upload:', error)
                })
            }

            reader.readAsDataURL(this.blob)
        }
    }
}
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

    start(run = undefined) {
        this.prepare_card()
        this.interval = setInterval(() => { this.set_interval(run) }, 1000)
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

        seconds = info.minutes * 60 + info.seconds

        current = time_to_text(seconds)

        if (run !== undefined)
            run()

        chronometer_current.html(current)
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
            $('.spinner:not(.done)').removeClass('d-none')
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
                .then((data) => {
                    console.log('Upload bem-sucedido:', data)
                    this.complete_cards(data)
                })
                .catch(error => {
                    console.log(error)
                    alert('Erro no upload: ' + error.message)
                })
            }

            reader.readAsDataURL(this.blob)
        }
    }

    complete_cards(data) {
        let response_recorder = $('.response-voice:not(.done)'),
            request_transcriptions = $(this.element.find('.transcriptions')),
            response_transcriptions = $(response_recorder.find('.transcriptions')),
            language = data.request.language,
            request_text = data.request.transcribe,
            response_text = data.response.gpt_response,
            response_duration = Math.round(data.response.audio_duration) + 1

        // request
        $('.spinner:not(.done)').addClass('d-none done')
        this.element.addClass('recorded')
        $(this.element.find('.btn-record')).removeAttr('disabled')

        request_transcriptions
            .addClass('show d-flex')
            .removeClass('d-none')

        $(request_transcriptions.find('.transcription'))
            .append(`<p><strong>Idioma:</strong> ${language}</p><p>${request_text}</p>`)

        // response
        response_recorder.removeClass('d-none').addClass('done')
        response_transcriptions
            .addClass('show d-flex')
            .removeClass('d-none')

        $(response_transcriptions.find('.transcription'))
            .append(`<p><strong>Idioma:</strong> ${language}</p><p>${response_text}</p>`)

        $(response_recorder.find('.chronometer-max span')).html(time_to_text(response_duration))
        $(response_recorder.find('.triggers')).attr('aria-max', response_duration)

        const byte_chars = atob(data.response.audio_base64),
            byte_numbers = new Array(byte_chars.length)

        for (let i = 0; i < byte_chars.length; i++) {
            byte_numbers[i] = byte_chars.charCodeAt(i)
        }

        const blob = new Blob([new Uint8Array(byte_numbers)], { type: 'audio/mp3' })
        $(response_recorder.find('audio'))[0].src = window.URL.createObjectURL(blob)
    }
}

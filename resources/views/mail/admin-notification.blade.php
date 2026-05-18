<x-mail::message>
    # Hello,

    {{ $messageContent }}

    <x-mail::button :url="config('app.url')">
        View Your Tasks
    </x-mail::button>

    Thanks,<br>
    The Admin Team
</x-mail::message>

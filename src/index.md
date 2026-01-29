---
layout: base.html
title: Home Page
---

<div x-data="{ open: false }">
    <h2 class="text-2xl font-bold mb-4">Welcome to my new site!</h2>
    <p class="mb-4">This is a static site built with 11ty, Tailwind, and Alpine.</p>
    <!-- Simple Alpine.js interaction test -->
    <button @click="open = !open" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Toggle Secret Message
    </button>

    <div x-show="open" class="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
        Alpine.js is working perfectly!
    </div>
</div>

<div class="mt-8">
    <h2 class="text-2xl font-bold mb-4">Latest Posts</h2>
    <ul class="space-y-2">
        {% for post in collections.post %}
            <li class="bg-white p-4 rounded shadow">
                <a href="{{ post.url }}" class="text-blue-600 font-bold text-lg hover:underline">
                    {{ post.data.title }}
                </a>
                <p class="text-gray-500 text-sm">
                    {{ post.date | date: "%Y-%m-%d" }}
                </p>
            </li>
        {% endfor %}
    </ul>
</div>
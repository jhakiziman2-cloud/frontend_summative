## Campus Life Planner

Purpose

Campus Life Planner helps a student keep track of tasks and events such as assignments, meetings, gym sessions and club activities. It shows how much time those tasks take, warns the student when they have planned too much, and lets them search their tasks using patterns. It is built with plain web technologies and keeps all data in the browser, so it works without an account.

What the Student Can Do

•Add a task with a title, due date, length in minutes, and a tag.
•See clear error messages while typing, before saving.
•View all tasks, sort them, and search them with a pattern search that highlights matches.
•See a dashboard with the number of tasks, total time, most used tag, and a seven-day chart.
•Set a time limit and get a warning when the planned time goes over it.
•Keep data after closing the browser, and move it between devices by exporting and importing a file.
•Show durations in minutes or hours.

Pages

The app is a single page with five sections. Only one section shows at a time, and the student switches between them using the buttons at the top.

•About: a short description of the project and the author’s contact details.
•Dashboard: three summary boxes, a message about the time limit, and a seven-day chart.
•Records: a search box, a sort choice, an ignore-case option, and a list of task cards. Each card can be edited in place or deleted.
•Add / Edit: a form with four fields, each with its own error message.
•Settings: the duration display choice, the time limit, export, import, and sample data.

Wireframe Descriptions

Every page is designed for a phone first. On a phone, everything sits in one column below a header that holds the title and navigation buttons. A footer closes each page.

•Dashboard: the three summary boxes are stacked one under another. Below them is the time limit message, then a row of seven small bars for the last seven days, each labelled with its date and task count. On tablets the boxes sit side by side.

•Records: the search box, sort choice and ignore-case option appear at the top, followed by a line saying how many tasks match. Each task card shows the title, due date, length, tag, and Edit and Delete buttons. Matching text is highlighted. Cards are one per row on phones, two on tablets and three on desktops.

•Add / Edit: four labelled fields stacked in order, with a red message under each one that has a problem. Save and Cancel buttons sit at the bottom.

•Settings: a choice for minutes or hours, a field for the time limit, a Save button, then the data buttons for export, sample data and import.

Data Model

Each task holds the following information:

•Identifier: a unique label for the task.
•Title: cannot begin or end with a space and cannot repeat a word twice in a row, such as “the the”.
•Due date: written as year, month, day, and it must be a real calendar date, including leap years.
•Duration: a number of minutes, zero or more, with up to two decimal places and no extra leading zeros.
•Tag: letters only, with single spaces or hyphens between words.
•Created and updated times: the moments the task was first saved and last changed.
The app also saves two settings: whether durations are shown in minutes or hours, and the time limit in minutes. Durations are always stored in minutes, and the setting only changes how they are shown.
Tasks and settings are saved in the browser. When the app starts, saved data is checked, and anything damaged is replaced with safe defaults. Imported files go through the same checks and are rejected if any task is invalid or if two tasks share an identifier.


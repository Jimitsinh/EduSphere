import React from "react";

function Svg({ children }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconDashboard() {
  return (
    <Svg>
      <path
        d="M4 13.5V20a1 1 0 0 0 1 1h5v-7.5H4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M14 3h5a1 1 0 0 1 1 1v7.5h-6V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 3h5v7.5H4V3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M14 13.5h6V20a1 1 0 0 1-1 1h-5v-7.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </Svg>
  );
}

export function IconCourses() {
  return (
    <Svg>
      <path
        d="M4.5 5.5h15v13h-15v-13Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 8h10M7 11h10M7 14h7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconLive() {
  return (
    <Svg>
      <path
        d="M4.5 7.5h12v9h-12v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.5 10.2l3-1.7v7l-3-1.7v-3.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconAssignments() {
  return (
    <Svg>
      <path
        d="M7 4h10v16H7V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconExams() {
  return (
    <Svg>
      <path
        d="M7 4h10v16H7V4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 9h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 13h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 17h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconAnalytics() {
  return (
    <Svg>
      <path
        d="M5 19V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 19V5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19 19v-8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSettings() {
  return (
    <Svg>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a7.8 7.8 0 0 0 .1-6l-2.1.4a6.1 6.1 0 0 0-1.3-1.3L16.5 6a7.8 7.8 0 0 0-6-.1l.4 2.1a6.1 6.1 0 0 0-1.3 1.3L7.5 9A7.8 7.8 0 0 0 7.4 15l2.1-.4c.4.5.8 1 1.3 1.3L10.5 18a7.8 7.8 0 0 0 6 .1l-.4-2.1c.5-.4 1-.8 1.3-1.3l2-.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </Svg>
  );
}

export function IconBell() {
  return (
    <Svg>
      <path
        d="M12 22a2.2 2.2 0 0 0 2.1-1.6H9.9A2.2 2.2 0 0 0 12 22Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M18 16H6c1-1.2 1.5-2.5 1.5-4.2V10a4.5 4.5 0 1 1 9 0v1.8c0 1.7.5 3 1.5 4.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconSearch() {
  return (
    <Svg>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconSunMoon() {
  return (
    <Svg>
      <path
        d="M21 12.4A7.5 7.5 0 0 1 11.6 3a6 6 0 1 0 6.4 9.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMenu() {
  return (
    <Svg>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}


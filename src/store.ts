import { writable, Writable } from "svelte/store";

export const sidebarActive: Writable<boolean> = writable(false);

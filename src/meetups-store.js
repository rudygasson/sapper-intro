import { writable } from "svelte/store";

const meetups = writable([]);

const customMeetupStore = {
    subscribe: meetups.subscribe,
    setMeetups: (meetupArray) => {
        meetups.set(meetupArray);
    },
    addMeetup: (newMeetup) => {
        meetups.update((items) => [newMeetup, ...items]);
    },
    updateMeetup: (id, meetupData) => {
        meetups.update((items) => {
            const meetupIndex = items.findIndex((i) => i.id === id);
            const updatedMeetup = { ...items[meetupIndex], ...meetupData };
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = updatedMeetup;
            return updatedMeetups;
        });
    },
    removeMeetup: (id) => {
        meetups.update((items) => {
            return items.filter((i) => i.id !== id);
        });
    },
    toggleFavorite: (id) => {
        meetups.update((items) => {
            const index = items.findIndex((m) => m.id === id);
            items[index].isFavorite = !items[index].isFavorite;
            return items;
        });
    }
};

export default customMeetupStore;

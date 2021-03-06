<script context="module">
    export function preload(page) {
        console.log(page);
        return this.fetch(
            "https://svelte-course-6dd11.firebaseio.com/meetups.json"
        )
            .then((res) => {
                if (!res.ok) {
                    throw new Error("An error occurred, please try again!");
                }
                return res.json();
            })
            .then((data) => {
                const loadedMeetups = Object.keys(data).map((key) => {
                    return { id: key, ...data[key] };
                });
                return { fetchedmeetups: loadedMeetups.reverse() };
                // isLoading = false;
                // meetups.setMeetups(loadedMeetups.reverse());
            })
            .catch((err) => {
                console.log(err);
                this.error(500, "Could not fetch meetups");
            });
    }
</script>

<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import { scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import meetups from "../meetups-store";
    import MeetupItem from "../components/Meetup/MeetupItem.svelte";
    import MeetupFilter from "../components/Meetup/MeetupFilter.svelte";
    import Button from "../components/UI/Button.svelte";
    import EditMeetup from "../components/Meetup/EditMeetup.svelte";
    import LoadingSpinner from "../components/UI/LoadingSpinner.svelte";

    export let fetchedmeetups;

    let loadedMeetups = [];
    let editMode = null;
    let editedId;
    let isLoading;
    let unsubscribe

    const dispatch = createEventDispatcher();
    let isFiltered = false;

    $: filteredMeetups = isFiltered
        ? loadedMeetups.filter((m) => m.isFavorite)
        : loadedMeetups;

    onMount(() => {
        unsubscribe = meetups.subscribe((items) => {
            loadedMeetups = items;
        });
        meetups.setMeetups(fetchedmeetups);
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    function setFilter(event) {
        isFiltered = event.detail;
    }

    function savedMeetup(event) {
        editMode = null;
        editedId = null;
    }

    function cancelEdit(event) {
        editMode = null;
        editedId = null;
    }

    function startEdit(event) {
        editMode = "edit";
        editedId = event.detail;
    }

    function startAdd(event) {
        editMode = "edit";
    }
</script>

<style>
    #meetups {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-gap: 1rem;
    }

    #meetup-controls {
        margin: 1rem;
        display: flex;
        justify-content: space-between;
    }

    @media (min-width: 768px) {
        #meetups {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    #no-meetups {
        margin: 1rem;
    }
</style>

<svelte:head>
    <title>All meetups</title>
</svelte:head>

{#if editMode === 'edit'}
    <EditMeetup id={editedId} on:save={savedMeetup} on:cancel={cancelEdit} />
{/if}
{#if isLoading}
    <LoadingSpinner />
{:else}
    <section id="meetup-controls">
        <MeetupFilter {isFiltered} on:select={setFilter} />
        <Button on:click={startAdd}>New Meetup</Button>
    </section>
    {#if filteredMeetups.length === 0}
        <p id="no-meetups">No meetups found, you can start adding some.</p>
    {/if}
    <section in:scale id="meetups">
        {#each filteredMeetups as meetup (meetup.id)}
            <div transition:scale|local animate:flip={{ duration: 600 }}>
                <MeetupItem
                    id={meetup.id}
                    title={meetup.title}
                    subtitle={meetup.subtitle}
                    address={meetup.address}
                    description={meetup.description}
                    imageUrl={meetup.imageUrl}
                    isFavorite={meetup.isFavorite}
                    on:edit={startEdit} />
            </div>
        {/each}
    </section>
{/if}

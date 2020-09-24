<script>
    import meetups from "../../meetups-store";
    import { createEventDispatcher } from "svelte";
    import TextInput from "../UI/TextInput.svelte";
    import Button from "../UI/Button.svelte";
    import Modal from "../UI/Modal.svelte";
    import { isEmpty, isValidEmail } from "../../helpers/validation";

    export let id = null;

    let title = "";
    let subtitle = "";
    let address = "";
    let email = "";
    let contactEmail = "";
    let description = "";
    let imageUrl = "";

    if (id) {
        const unsubscribe = meetups.subscribe((items) => {
            const selectedMeetup = items.find((i) => i.id === id);
            ({
                title,
                subtitle,
                address,
                contactEmail: email,
                description,
                imageUrl
            } = selectedMeetup);
        });
        unsubscribe();
    }

    const dispatch = createEventDispatcher();

    $: titleValid = !isEmpty(title);
    $: subtitleValid = !isEmpty(subtitle);
    $: addressValid = !isEmpty(address);
    $: emailValid = isValidEmail(email);
    $: descriptionValid = !isEmpty(description);
    $: imageUrlValid = !isEmpty(imageUrl);
    $: formIsValid =
        titleValid &&
        subtitleValid &&
        addressValid &&
        emailValid &&
        descriptionValid &&
        imageUrlValid;

    function submitForm() {
        const meetupData = {
            title,
            subtitle,
            address,
            contactEmail: email,
            description,
            imageUrl
        };

        if (id) {
            fetch(
                `https://svelte-course-6dd11.firebaseio.com/meetups/${id}.json`,
                {
                    method: "PATCH",
                    body: JSON.stringify(meetupData),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            )
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("An error occurred, please try again!");
                    }
                    meetups.updateMeetup(id, meetupData);
                })
                .catch((err) => console.log(err));
        } else {
            fetch("https://svelte-course-6dd11.firebaseio.com/meetups.json", {
                method: "POST",
                body: JSON.stringify({ ...meetupData, isFavorite: false }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("An error occurred, please try again!");
                    }
                    return res.json();
                })
                .then((data) => {
                    meetups.addMeetup({
                        ...meetupData,
                        isFavorite: false,
                        id: data.name
                    });
                })
                .catch((err) => console.log(err));
        }
        dispatch("save");
    }

    function deleteMeetup() {
        fetch(`https://svelte-course-6dd11.firebaseio.com/meetups/${id}.json`, {
            method: "DELETE"
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("An error occurred, please try again!");
                }
                meetups.removeMeetup(id);
            })
            .catch((err) => console.log(err));
        dispatch("save");
    }

    function cancel() {
        dispatch("cancel");
    }
</script>

<style>
    form {
        width: 100%;
    }
</style>

<Modal title="Edit Meetup Data" on:cancel>
    <form on:submit|preventDefault={submitForm}>
        <TextInput
            id="title"
            label="Title"
            value={title}
            valid={titleValid}
            validityMessage="Please enter a valid title."
            on:input={(event) => (title = event.target.value)} />
        <TextInput
            id="subtitle"
            label="Subtitle"
            value={subtitle}
            valid={subtitleValid}
            validityMessage="Please enter a valid subtitle."
            on:input={(event) => (subtitle = event.target.value)} />
        <TextInput
            id="address"
            label="Address"
            value={address}
            valid={addressValid}
            validityMessage="Please enter a valid adress."
            on:input={(event) => (address = event.target.value)} />
        <TextInput
            id="imageUrl"
            label="Image URL"
            type="url"
            value={imageUrl}
            valid={imageUrlValid}
            validityMessage="Please enter a valid image URL."
            on:input={(event) => (imageUrl = event.target.value)} />
        <TextInput
            id="email"
            label="E-Mail"
            type="email"
            value={email}
            valid={emailValid}
            validityMessage="Please enter a valid email adress."
            on:input={(event) => (email = event.target.value)} />
        <TextInput
            controlType="textarea"
            rows="3"
            id="description"
            label="Description"
            bind:value={description}
            valid={descriptionValid}
            validityMessage="Please enter a valid description." />
    </form>
    <div slot="footer">
        <Button mode="outline" on:click={cancel}>Cancel</Button>
        <Button disabled={!formIsValid} on:click={submitForm}>Save</Button>
        {#if id}
            <Button type="button" on:click={deleteMeetup}>Delete</Button>
        {/if}
    </div>
</Modal>

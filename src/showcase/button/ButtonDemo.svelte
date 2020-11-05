<script lang="ts">
    import Button from "../../components/button/Button.svelte";
</script>

<div>
    <div class="content-section introduction">
        <div class="feature-intro">
            <h1>Button</h1>
            <p>Button is an extension to standard button element with icons and theming.</p>
        </div>
    </div>

    <div class="content-section implementation">
        <div class="card">
            <h5>Basic</h5>
            <!-- <Button on:click={handleClick} label="Clicked" /> -->
            <Button label="Submit" />
            <Button label="Disabled" disabled />
            <Button label="Link" className="p-button-link" />

            <h5>Icons</h5>
            <Button icon="pi pi-check" />
            <Button label="Submit" icon="pi pi-check" />
            <Button label="Submit" icon="pi pi-check" iconPos="right" />

            <h5>Severities</h5>
            <Button label="Primary" />
            <Button label="Secondary" className="p-button-secondary" />
            <Button label="Success" className="p-button-success" />
            <Button label="Info" className="p-button-info" />
            <Button label="Warning" className="p-button-warning" />
            <Button label="Help" className="p-button-help" />
            <Button label="Danger" className="p-button-danger" />

            <h5>Raised Buttons</h5>
            <Button label="Primary" className="p-button-raised" />
            <Button label="Secondary" className="p-button-raised p-button-secondary" />
            <Button label="Success" className="p-button-raised p-button-success" />
            <Button label="Info" className="p-button-raised p-button-info" />
            <Button label="Warning" className="p-button-raised p-button-warning" />
            <Button label="Help" className="p-button-raised p-button-help" />
            <Button label="Danger" className="p-button-raised p-button-danger" />

            <h5>Rounded Buttons</h5>
            <Button label="Primary" className="p-button-rounded" />
            <Button label="Secondary" className="p-button-rounded p-button-secondary" />
            <Button label="Success" className="p-button-rounded p-button-success" />
            <Button label="Info" className="p-button-rounded p-button-info" />
            <Button label="Warning" className="p-button-rounded p-button-warning" />
            <Button label="Help" className="p-button-rounded p-button-help" />
            <Button label="Danger" className="p-button-rounded p-button-danger" />

            <h5>Text Buttons</h5>
            <Button label="Primary" className="p-button-text" />
            <Button label="Secondary" className="p-button-secondary p-button-text" />
            <Button label="Success" className="p-button-success p-button-text" />
            <Button label="Info" className="p-button-info p-button-text" />
            <Button label="Warning" className="p-button-warning p-button-text" />
            <Button label="Help" className="p-button-help p-button-text" />
            <Button label="Danger" className="p-button-danger p-button-text" />
            <Button label="Plain" className="p-button-text p-button-plain" />

            <h5>Raised Text Buttons</h5>
            <Button label="Primary" className="p-button-raised p-button-text" />
            <Button label="Secondary" className="p-button-raised p-button-secondary p-button-text" />
            <Button label="Success" className="p-button-raised p-button-success p-button-text" />
            <Button label="Info" className="p-button-raised p-button-info p-button-text" />
            <Button label="Warning" className="p-button-raised p-button-warning p-button-text" />
            <Button label="Help" className="p-button-raised p-button-help p-button-text" />
            <Button label="Danger" className="p-button-raised p-button-danger p-button-text" />
            <Button label="Plain" className="p-button-raised p-button-text p-button-plain" />

            <h5>Outlined Buttons</h5>
            <Button label="Primary" className="p-button-outlined" />
            <Button label="Secondary" className="p-button-outlined p-button-secondary" />
            <Button label="Success" className="p-button-outlined p-button-success" />
            <Button label="Info" className="p-button-outlined p-button-info" />
            <Button label="Warning" className="p-button-outlined p-button-warning" />
            <Button label="Help" className="p-button-outlined p-button-help" />
            <Button label="Danger" className="p-button-outlined p-button-danger" />

            <h5>Rounded Icon Buttons</h5>
            <Button icon="pi pi-bookmark" className="p-button-rounded p-button-secondary" />
            <Button icon="pi pi-search" className="p-button-rounded p-button-success" />
            <Button icon="pi pi-user" className="p-button-rounded p-button-info" />
            <Button icon="pi pi-bell" className="p-button-rounded p-button-warning" />
            <Button icon="pi pi-heart" className="p-button-rounded p-button-help" />
            <Button icon="pi pi-times" className="p-button-rounded p-button-danger" />
            <Button icon="pi pi-check" className="p-button-rounded" />

            <h5>Rounded Text Icon Buttons</h5>
            <Button icon="pi pi-check" className="p-button-rounded p-button-text" />
            <Button icon="pi pi-bookmark" className="p-button-rounded p-button-secondary p-button-text" />
            <Button icon="pi pi-search" className="p-button-rounded p-button-success p-button-text" />
            <Button icon="pi pi-user" className="p-button-rounded p-button-info p-button-text" />
            <Button icon="pi pi-bell" className="p-button-rounded p-button-warning p-button-text" />
            <Button icon="pi pi-heart" className="p-button-rounded p-button-help p-button-text" />
            <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" />
            <Button icon="pi pi-filter" className="p-button-rounded p-button-text p-button-plain" />

            <h5>Rounded and Outlined Icon Buttons</h5>
            <Button icon="pi pi-check" className="p-button-rounded p-button-outlined" />
            <Button icon="pi pi-bookmark" className="p-button-rounded p-button-secondary p-button-outlined" />
            <Button icon="pi pi-search" className="p-button-rounded p-button-success p-button-outlined" />
            <Button icon="pi pi-user" className="p-button-rounded p-button-info p-button-outlined" />
            <Button icon="pi pi-bell" className="p-button-rounded p-button-warning p-button-outlined" />
            <Button icon="pi pi-heart" className="p-button-rounded p-button-help p-button-outlined" />
            <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-outlined" />

            <h5>Badges</h5>
            <Button label="Emails" badge="8" />
            <Button label="Messages" icon="pi pi-users" className="p-button-warning" badge="8" badgeClass="p-badge-danger" />

            <h5>Button Set</h5>
            <span class="p-buttonset">
                <Button label="Save" icon="pi pi-check" />
                <Button label="Delete" icon="pi pi-trash" />
                <Button label="Cancel" icon="pi pi-times" />
            </span>

            <h5>Sizes</h5>
            <div class="sizes">
                <Button label="Small" icon="pi pi-check" className="p-button-sm"  />
                <Button label="Normal" icon="pi pi-check" className="p-button"  />
                <Button label="Large" icon="pi pi-check" className="p-button-lg" />
            </div>
        </div>
    </div>
</div>

<style scoped>
:global(.p-button) {
    margin-right: .5rem;
}
@media screen and (max-width: 960px) {
    :global(.p-button) {
        display: flex;
        width: 100%;
    }
}
</style>

async function copyLink(){
    await navigator.clipboard.writeText(window.location.href)
    const tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Link kopiran";
    console.log('kopirano')
}

function outFunc() {
    const tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Kopiraj link";
    console.log('out')
}

function changeOutcome(select, index) {
    const matchInput = document.querySelector('#match' + index)
    const match = JSON.parse(matchInput.value);
    if (match) {
        match.outcome = select.value
        matchInput.value = JSON.stringify(match)
    }
}
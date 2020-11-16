
export function tabfocusoutline() {

    document.documentElement.classList.add("focus-no-outline")

    window.addEventListener('keydown', (evt) => {

        if (evt.key == 'Tab') {
            document.documentElement.classList.add("focus-outline")
        }
    });

    window.addEventListener('mousedown', (evt) => {
        document.documentElement.classList.remove("focus-outline")
    });
}

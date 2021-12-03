export default function getFormattedCategory(str) {
    return str.charAt(0).toUpperCase() + str.replace('_', ' ').slice(1);
}
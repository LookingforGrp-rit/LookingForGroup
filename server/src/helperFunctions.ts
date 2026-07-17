//File for various helper functions
//May or may not be used

// export const sortLabelNumberArrayAlphabetically = (array: { id: number, label: string, type: string }[]) => {
//     //Weird nonsense
//     // array = array.toSorted((a, b) => {
//     //     let shorterLabelLength: number = a.label.length;

//     //     //Find shorter of the 2 labels
//     //     //If they're the same length
//     //     if (a.label.length > b.label.length) {
//     //         shorterLabelLength = b.label.length;
//     //     } else {
//     //         shorterLabelLength = a.label.length;
//     //     }

//     //     for (let i = 0; i < shorterLabelLength; i++) {

//     //     }
//     // });

//     //return array;

//     //If problems come up, change this to be more specific
//     //It looks like the objects in the database are already somewhat alphabetized
//     array = array.toSorted((object1, object2) => {
//         return object1.label.charCodeAt(0) - object2.label.charCodeAt(0);
//     })
// }

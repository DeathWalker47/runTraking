import { validateForms } from '../functions/validate-forms.js';

// const rules = [
//   {
//     ruleSelector: '.input-name',
//     rules: [
//       {
//         rule: 'minLength',
//         value: 3
//       },
//       {
//         rule: 'required',
//         value: true,
//         errorMessage: 'Заполните имя!'
//       }
//     ]
//   },
//   {
//     ruleSelector: '.input-email',
//     rules: [
//       {
//         rule: 'required',
//         value: true,
//         errorMessage: 'Заполните Email!'
//       },
//       {
//         rule: 'email',
//         value: true,
//         errorMessage: 'Введите корректный email!'
//       }
//     ]
//   },
//   {
//     ruleSelector: '.input-city',
//     rules: [
//       {
//         rule: 'required',
//         value: true,
//         errorMessage: 'Введите свой город!'
//       }
//     ]
//   },
//   {
//     ruleSelector: '.input-tel',
//     tel: true,
//     telError: 'Введите корректный телефон',
//     rules: [
//       {
//         rule: 'required',
//         value: true,
//         errorMessage: 'Заполните телефон!'
//       }
//     ]
//   },
// ];


// const afterForm = () => {
//   console.log('Произошла отправка, тут можно писать любые действия');
// };

// validateForms('.form', rules, afterForm);
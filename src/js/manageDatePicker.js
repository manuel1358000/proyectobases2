function loadDatePicker(){
     const picker = datepicker('#id_nacimiento',{
        dateSelected: new Date() ,
        formatter: (input, date, instance) => {
            const value = date.toLocaleDateString('en-GB')
            input.value = value // => '1/1/2099',
          }
        
     });
     const picker2 = datepicker('#id_contratacion',{
        dateSelected: new Date() ,
        formatter: (input, date, instance) => {
            const value = date.toLocaleDateString('en-GB')
            input.value = value // => '1/1/2099',
          }
        
     });
    
}
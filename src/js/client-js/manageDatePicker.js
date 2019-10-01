function loadDatePicker(){
    

     const picker = datepicker('#_inputFecha_Nac',{
        dateSelected: new Date() ,
        formatter: (input, date, instance) => {
            const value = date.toLocaleDateString('en-GB')
            input.value = value // => '1/1/2099',
          }
        
     });
    
}


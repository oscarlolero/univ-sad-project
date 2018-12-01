let socket = io();

socket.on('connect', () => {
	console.log('Conectado');
});

document.querySelector('.btn-add').addEventListener('click', e => {
    const type = document.querySelector('.js_global_container').dataset.type;
    // const fields = document.querySelector('.insert-modal .modal-body'); //.childElementCount
    let numInputElements;
    let fieldsArray = [];

    switch (type) {
        case 'departments': {
            numInputElements = 1;
        break
        }

        case 'professors': {
            numInputElements = 4;
            //Leer departamento
            fieldsArray.push(parseInt(document.querySelector('.input100-select').value));
            //Leer si es admin
            if(document.querySelector('.btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
       break;
        }

        default: return console.log('Error at processing container type.');
        break;
    }

    for(let i = 0; i < numInputElements; i++) {
        fieldsArray.push(document.getElementById(`field${i+1}`).value);
    }

    socket.emit('insertRow', {
        type,
        fieldsArray
    }, (msg) => {
        location.reload();
        $('#addModal').modal('hide');
    });
});

document.querySelector('.btn-edit').addEventListener('click', e => {
    const type = document.querySelector('.js_global_container').dataset.type;
    const fields = document.querySelector('.edit-modal .modal-body') //.childElementCount
       
    let numInputElements;
    let fieldsArray = [];

    switch (type) {
        case 'departments': {
            numInputElements = 1;
        break
        }

        case 'professors': {
            numInputElements = 4;
            //Leer departamento
            fieldsArray.push(parseInt($('.input100-select-edit').find(':selected').data('dep_id')));
            //Leer si es admin
            if(document.querySelector('.edit-modal .btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
       break;
        }

        default: return console.log('Error at processing container type.');
        break;
    }

    for(let i = 0; i < numInputElements; i++) {
        fieldsArray.push(document.getElementById(`efield${i+1}`).value);
    }

    console.log(fieldsArray);
    socket.emit('updateRow', {
        type,
        fieldsArray,
        id: document.querySelector('.edit-modal').dataset.js_edit_id
    }, (msg) => {
        location.reload();
        $('#editModal').modal('hide');
    });
});

document.querySelectorAll('.columnAction span').forEach(e => e.addEventListener('click', e => {
	
    const process = e.target.closest('span').dataset.process.split('-');
    document.querySelector('.edit-modal').dataset.js_edit_id = process[1];

	if(process[0] === 'delete') {
		const type = document.querySelector('.js_global_container').dataset.type;
		const item = document.querySelector(`[data-process="delete-${process[1]}"]`);
		if(item) document.querySelector('tbody').removeChild(item.parentElement.parentElement);
		
		socket.emit('deleteRow', {
			type,
			id: process[1]
		}, () => {
			// console.log('Socket emited');
		});
	} else if(process[0] === 'edit') {

        const cols = document.querySelector(`[data-process="edit-${process[1]}"]`).parentElement.parentElement;
        const type = document.querySelector('.js_global_container').dataset.type;
    
        switch (type) {
            case 'departments': {
                const selector = document.getElementById('efield1');
                selector.value = cols.children[0].textContent.trim();
                selector.classList.add('has-val');
            break
            }
    
            case 'professors': {
                //Get list of departments and select the actual department
                const selectSelector = document.querySelector('.input100-select-edit');
                socket.emit('getDepartments', {
                }, (departments) => {
                    while (selectSelector.firstChild) {
                        selectSelector.removeChild(selectSelector.firstChild);
                    } 
                    let markup = '';
                    departments.forEach((e, index) => {
                        markup = markup.concat(`<option value="${index}" data-dep_id="${e.department_id}">${e.descr}</option>`);
                    });
                    selectSelector.insertAdjacentHTML('beforeend', markup);

                    for(let i = 0; i <= selectSelector.childElementCount - 1; i++) {
                        if(cols.children[1].textContent == selectSelector.children[i].textContent) {
                            selectSelector.value = i;
                        }
                    }
                });

                //Get inputs
                //Get first and last name   
                socket.emit('getProfessorName', {
                    professor_id: document.querySelector('.edit-modal').dataset.js_edit_id
                }, (professorRow) => {
                    const [fistNameField, lastNameField] = [document.getElementById('efield1'), document.getElementById('efield2')];
                    fistNameField.value = professorRow[0].first_name;
                    lastNameField.value = professorRow[0].last_name;
                    fistNameField.classList.add('has-val');
                    lastNameField.classList.add('has-val');
                });

                //Get username and password
                const [usernameField, passwordField] = [document.getElementById('efield3'), document.getElementById('efield4')];
                usernameField.value = cols.children[2].textContent.trim();
                passwordField.value = cols.children[3].textContent.trim();
                usernameField.classList.add('has-val');
                passwordField.classList.add('has-val');

                //Select if is admin or not
                const isAdminSelector = document.querySelector('.edit-modal .btn-group-toggle');
                if(cols.children[4].textContent.trim() === 'Yes') {
                    isAdminSelector.children[0].classList.remove('active');
                    isAdminSelector.children[1].classList.add('active');
                } else {
                    isAdminSelector.children[0].classList.add('active');
                    isAdminSelector.children[1].classList.remove('active');            
                }
            break;
            }
    
            default: return console.log('Error at processing container type.');
            break;
        }
	} else {
		console.log('Error processing click action.');
	}
}));

//TABLE
(function ($) {
	"use strict";
	$('.column100').on('mouseover',function(){
		var table1 = $(this).parent().parent().parent();
		var table2 = $(this).parent().parent();
		var verTable = $(table1).data('vertable')+"";
		var column = $(this).data('column') + ""; 

		$(table2).find("."+column).addClass('hov-column-'+ verTable);
		$(table1).find(".row100.head ."+column).addClass('hov-column-head-'+ verTable);
	});

	$('.column100').on('mouseout',function(){
		var table1 = $(this).parent().parent().parent();
		var table2 = $(this).parent().parent();
		var verTable = $(table1).data('vertable')+"";
		var column = $(this).data('column') + ""; 

		$(table2).find("."+column).removeClass('hov-column-'+ verTable);
		$(table1).find(".row100.head ."+column).removeClass('hov-column-head-'+ verTable);
	});
    

})(jQuery);

//Login page styling
(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.btn-validate').on('click',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    
})(jQuery);
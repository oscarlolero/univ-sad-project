let socket = io();

socket.on('connect', () => {
	console.log('Conectado');
});

document.querySelector('.btn-add').addEventListener('click', e => {
    const type = document.querySelector('.js_global_container').dataset.type;
    const fields = document.querySelector('.insert-modal .modal-body'); //.childElementCount
    
    let fieldsArray = [];
    for(let i = 0; i < fields.childElementCount; i++) {
        fieldsArray.push(document.getElementById(`field${i+1}`).value);
    }
    console.log(fieldsArray);
    socket.emit('insertRow', {
        type,
        fieldsArray
    }, (msg) => {
        location.reload();
        $('#addModal').modal('hide');
    });
});

document.querySelector('.btn-edit').addEventListener('click', e => {
    console.log('pressed');
    const type = document.querySelector('.js_global_container').dataset.type;
    const fields = document.querySelector('.edit-modal .modal-body') //.childElementCount
    
    let fieldsArray = [];
    for(let i = 0; i < fields.childElementCount; i++) {
        fieldsArray.push(document.getElementById(`efield${i+1}`).value);
    }

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

        for(let i = 0; i < cols.childElementCount - 1; i++) {
            const actualCol = document.getElementById(`efield${i+1}`);
            actualCol.value = cols.children[i].textContent.trim();
            actualCol.classList.add('has-val');
        }
        document.querySelector('.edit-modal').dataset.js_edit_id = process[1];
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

    $('.validate-form').on('submit',function(){
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
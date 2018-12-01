let socket = io();

socket.on('connect', () => {
	console.log('Conectado');
});

document.querySelectorAll('.columnAction span').forEach(e => e.addEventListener('click', (e) => {
	
	const process = e.target.closest('span').dataset.process.split('-');
	if(process[0] === 'delete') {
		const type = document.querySelector('.js_global_container').dataset.type;
		const item = document.querySelector(`[data-process="delete-${process[1]}"]`);
		if(item) document.querySelector('tbody').removeChild(item.parentElement.parentElement);
		
		socket.emit('deleteRow', {
			type,
			id: process[1]
		}, () => {
			console.log('Socket emited');
		});
	} else if(process[0] === 'edit') {

		console.log('EDIT');
	} else {

		console.log('Error processing click action.');
	}
}));

const deleteItem = id => {
    const item = document.querySelector(`[data-itemid="${id}"]`);
    if(item) item.parentElement.removeChild(item);
};

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
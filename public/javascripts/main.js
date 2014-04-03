$(document).ready(function(){
    $('#submit').click(function() {
        var regno = $("#regno").val();
        var currentDate = new Date();
        var formatedDate = currentDate.getDate() + "." + currentDate.getMonth() +"."+ currentDate.getFullYear();
        $.getJSON('/api', { 'regno':regno, 'date':formatedDate}, function(data) {
            console.log(data);
                var container = document.getElementById('chart');
                var chart = new google.visualization.Timeline(container);
                var dataTable = new google.visualization.DataTable();

            dataTable.addColumn({ type: 'string', id: 'Pojištění' });
            dataTable.addColumn({ type: 'date', id: 'Začátek' });
            dataTable.addColumn({ type: 'date', id: 'Konec' });


            var startDate = new Date(data.date_from);
            var endDate = new Date();
            if(data.date_till != null) {
               endDate = new Date(data.date_till);
            }

            data
            dataTable.addRows([
                [ data.company.name,  startDate,  endDate ]]);

            chart.draw(dataTable);
        });
        return false; // prevent default
    });
});
$(document).ready(function(){
    $('#submit').click(function() {
        var regno = $("#regno").val();
        var currentDate = new Date();
        var formatedDate = currentDate.getDate() + "." + (currentDate.getMonth()+1) +"."+ currentDate.getFullYear();
        $.getJSON('/api', { 'regno':regno, 'date':formatedDate}, function(data) {

                var container = document.getElementById('chart');
                var chart = new google.visualization.Timeline(container);
                var dataTable = new google.visualization.DataTable();

            dataTable.addColumn({ type: 'string', id: 'Pojištění' });
            dataTable.addColumn({ type: 'date', id: 'Začátek' });
            dataTable.addColumn({ type: 'date', id: 'Konec' });


            var rows = [];
            $.each(data, function(index,item){
                console.log(item);
                var startDate = new Date(item.date_from);
                var endDate = new Date();
                if(item.date_till != null) {
                    endDate = new Date(item.date_till);
                }
                var entry = [item.company.name, startDate, endDate];
                rows.push(entry);
            });


            dataTable.addRows(rows);

            chart.draw(dataTable);
        });
        return false; // prevent default
    });
});
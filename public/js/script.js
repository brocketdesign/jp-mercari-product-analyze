const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)

$(document).ready(function(){
    $('button#refresh').on('click',function(){
        $(' button#refresh').hide()
        if(!! document.querySelector('#sales')){
            $('#sales').html('...')
        }
        $.post('/refrsh', function(result){
            console.log(result)
            window.location.reload();
         });
    })
    $('#modif').on('click',function(){
        if( !! document.querySelector('.delete')){
            $('.delete').toggle()
        }
    })
    $('.delete').on('click',function(){
        $(this).hide()
        let keyword = $(this).attr('data-value')
        $.post('/best/delete',{keyword:keyword}, function(result){
            console.log(result)
            window.location.reload();
         });
    })
    $('.add').on('click',function(){
            $(this).hide()
        let keyword = $(this).attr('data-value')
        console.log(keyword)
        $.post('http://192.168.3.2:3035/add/',{keyword:keyword})
        console.log('Done')

    })

    if(!! document.querySelector('#graph1')){
        let sales = []
        let total = []
        let avg = []
        let tt = 0
        for (let i = 6 ; i >= 0 ; i--){
            setTimeout(() => {
                var date = new Date();
                date.addDays(-i);
                var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
                $.get('/result',{today:today},function(result){
                    if ( result.length != 0 ){
        
                        let element = result[0]
                        sales.push({y:element.sales,x:element.today})
                        total.push({y:element.total,x:element.today})
                        avg.push({y:element.avg,x:element.today})
                    }
                })
                if (i==0){
                    $(document).ajaxStop(function(){
                        chart('graph1','bar',sales,'売上合計額')
                        chart('graph2','scatter',total,'注文数')
                        chart('graph3','scatter',avg,'平均注文額')
                      });
                }
            }, tt);
            tt += 500
        }
    }
    checkingKeywords()
})


function checkingKeywords(){
        if( !! document.querySelector('.keyword') ){
            $.each($('.keyword'),function(){
                let $this = $(this)
                if( ($this.find('.uri').text() == '' )){
                    let keyword = $(this).attr('data-value')
                    console.log(keyword)
                    $.post( "/keyword/",{keyword:keyword}, function( result ) {
                        $this.find('.uri').text(result+' ¥')
                    })
                }
            })
        }
}
var _getDistanceFromTop = function (selector) {
    var scrollTop = $(window).scrollTop(),
      elementOffset = selector.offset().top,
      distance = (elementOffset - scrollTop);
    return distance;
}
function chart(name,type,values,title){

      let xRay = []
      let yRay = []
      for (let i = 0 ;i<values.length;i++){
          let element = values[i]
          xRay.push(element.x)
          yRay.push(element.y)
      };
      var data = [
          {
            x: xRay,
            y: yRay,
            type: type
          }
        ];
        var layout = {
            title: title,
            showlegend: false
        };
        Plotly.newPlot(name, data,layout,{staticPlot: false});
}
Date.prototype.addDays = function (n) {
    var time = this.getTime();
    var changedDate = new Date(time + (n * 24 * 60 * 60 * 1000));
    this.setTime(changedDate.getTime());
    return this;
};
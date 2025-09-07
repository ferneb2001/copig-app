procedure exln3
*listado de exptes por numero a¤o
*arma dbf para imprimir con excel.
wdesde={  /  /  }
whasta=date()
wcode=space(1)
wcoha=space(1)
wnrode=0
wnroha=0
wanode=0
wanoha=0
wkey=space(10)
wkey1=space(10)
set exclusive on
select 4
use exptmp
zap
use
set exclusive off
select 4
use exptmp
wren=0
set date to dmy
whoja=0
@03,02,23,78 box repl (chr(176),9)
*@03,02 clear to 23,78
@04,23 clear to 04,58
@03,22 say 'LISTADO DE EXPEDIENTES  ' color n/w
@06,19 clear to 06,62
@05,18 say 'Desde: A¤o       Letra      Numero '
@06,18 say 'Hasta: A¤o       Letra      Numero '
@08,18 say 'Liste exptes entre el ' color n/w
@08,48 say ' y el ' color n/w
@11,21 clear to 11,62
@05,29 get wanode PICT '9999'
@05,41 get wcode
@05,53 get wnrode PICT '99999'
@06,29 get wanoha PICT '9999'
@06,41 get wcoha
@06,53 get wnroha PICT '99999'
@07,20 say 'Indique la fecha desde y hasta del listado' color n/w 
@08,39 get wdesde
@08,54 get whasta
read
if lastkey()<>27
   wkey=str(wnrode,5)+str(wanode,4)+wcode
   wkey1=str(wnroha,5)+str(wanoha,4)+wcoha
   wlei=space(10)
   select 1
   use exptes
   index on str(nro,5)+str(ano,4)+cod to exptesa
   select 1
   use exptes index exptesa
   wcoda=wcode
   @09,01 clear to 16,77
   WOP1=SPACE(1)
   wop=1
   @21,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1;
         color scheme 4
   read
   if wop=1
      set date dmy   
      do while not eof()
         wlei=str(nro,5)+str(ano,4)+cod
         if wlei >=    wkey
            if wlei <=    wkey1
		          set date to ymd
                  if recep>= wdesde
                     if recep<= whasta
                        set date to dmy
                        do detalle
                     endif
                  endif
            endif
         endif
         set date to dmy
         select 1               
         skip
      enddo 
  endif      
endif
@03,02,23,78 box repl (chr(176),9)
close all
RETURN


procedure detalle
select 4
use exptmp
append blank
replace cod with a.cod
replace nro with a.nro
replace ano with a.ano
replace frecep with a.recep
replace matric  with a.matri
replace categ  with a.cat
replace rengl  with 1
wlin=1
replace rttes  with a.rtte
replace dests  with a.dest
wsi=0
append blank
if a.rtte2<>space(40)
   replace rttes with a.rtte2
   wsi=1
endif   
   if a.cpto<>space(75)
   	 replace dests with a.cpto
   	 wsi=1
   endif	 
if wsi=1
	wlin=wlin+1
   replace rengl with wlin
endif
if a.cpto2<>space(75)
   append blank	
   replace dests with a.cpto2
   wlin=wlin+1
   replace rengl with wlin 
endif
if a.cpto3<>space(75)
   append blank
   replace dests with a.cpto3
   wlin=wlin+1
   replace rengl with wlin
endif 
if a.cpto4<>space(75)
   append blank
   replace dests with a.cpto4
   wlin=wlin+1
   replace rengl with wlin
endif
select 1
do movimien     
return    

procedure movimien
select 2
use expmov index expmov
select 3
use psecc index psecn
select 2
set relation to secc into psecc
locate for cod=a.cod and nro=a.nro and ano=a.ano
if found()
   do while nro=a.nro
   	  select 4
   	  use exptmp
   	  append blank
   	  replace frecep with b.fecha
   	  replace dests  with b.obs
   	  replace rttes  with c.nom
   	  wlin=wlin+1
   	  replace rengl with wlin
   	  select 2
      skip
   enddo
endif
return      
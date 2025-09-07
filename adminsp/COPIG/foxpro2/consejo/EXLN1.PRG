procedure exln1
*listado de exptes por a¤o, letra, numero
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
wlin=99
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
   wkey=str(wanode,4)+wcode+str(wnrode,5)
   wkey1=str(wanoha,4)+wcoha+str(wnroha,5)
   wlei=space(10)
   select 1
   use exp2002
   index on str(ano,4)+cod+str(nro,5) to exptesn
   select 1
   use exp2002 index exptesn
   wcoda=wcode
   @09,01 clear to 16,77
   @10,03 say 'Coloque papel continuo 12X25 en la Impresora y oprima ENTER para continuar';
          color n/w
   read
   WOP1=SPACE(1)
   wop=1
   @21,30 get wop pict '@*H \<Imprimir;\<No imprimir' size 1,1;
         color scheme 4
   read
   if wop=1
      set date dmy   
      set console off
      set printer on
      set device to printer
      ???chr(27)+chr(67)+CHR(00)+chr(12)
      ???chr(27)+chr(48)
      ???chr(27)+chr(15)
      do while not eof()
         if wlin>89
            do titulos
         endif
*         if wcoda<>cod
*            do titulos
*            wcoda=cod
*         endif   
         wlei=str(ano,4)+cod+str(nro,5)
         if wlei >=    wkey
            if wlei <=    wkey1
		          set date to ymd
                  if recep>= wdesde
                     if recep<= whasta
                        if wcoda<>cod
                           do titulos
                           wcoda=cod
                        endif   
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
      eject
      set printer off
      set device to screen
  endif      
endif
@03,02,23,78 box repl (chr(176),9)
*@03,02 clear to 23,78
close all
RETURN

procedure titulos
set date to dmy
whoja=whoja+1
if whoja>1
   eject
endif
?'CONSEJO PROFESIONAL DE INGENIEROS Y GOLOGOS DE MENDOZA'
?'        Detalle de Expedientes  entre el '
??wdesde at 42 
??' y el ' at 52
??whasta
??'   Emitido el: ' at 75
??date()
??'  Hoja: '  at 101
??whoja pict '999'
?
?'L'    at  1
??'NUMERO'   at  3
??'A¥O'     at 10
??'FECHA'   at 14
??'MATR.CAT' at 25
??'REMITENTE                               OBSERVACIONES' at 35
*??'CONCEPTO'  at 70
?
wlin=4
return

procedure detalle
?COD    AT 1
??nro    at 3
??ANO    at 9
??RECEP at 14
??matri at 25
??cat   at 31
??rtte  at 36
??dest  at 77
wlin=wlin+1
if rtte2<>space(40)
   ?rtte2  at 36
   wlin=wlin+1
endif   
if cpto<>space(75)
   ?cpto at 60
   wlin=wlin+1
endif
if cpto2<>space(75)
   ?cpto2 at 60
   wlin=wlin+1
endif
if cpto3<>space(75)
   ?cpto3 at 60
   wlin=wlin+1
endif 
if cpto4<>space(75)
   ?cpto4 at 60
   wlin=wlin+1
endif
if wlin > 89
   do titulos
endif   
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
      ?fecha at 24
      ??hora at 35
      ??c.nom at 44
      ??obs   at 70
      wlin=wlin+1
      if wlin > 89
         do titulos
      endif   
      skip
   enddo
endif
?
wlin=wlin+1
return      
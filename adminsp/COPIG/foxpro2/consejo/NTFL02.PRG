procedure ntfl02
*listado de notificaciones por numero.   
wdesde={  /  /  }
whasta=date()
wcode=space(1)
wcoha=space(1)
wnrode=0
wnroha=0
wkey=space(5)
wkey1=space(7)
WKEY2=SPACE(9)
wlin=99
set date to dmy
whoja=0
@03,02,23,78 box repl (chr(176),9)
@04,23 clear to 04,58
@03,22 say 'LISTADO DE NOTIFICACIONES' color n/w
@06,19 clear to 06,62
@05,18 say 'Desde Numero '
@06,18 say 'Hasta Numero '
@11,21 clear to 11,62
@05,33 get wnrode PICT '99999'
@06,33 get wnroha PICT '99999'
read
if lastkey()<>27
   wkey=str(wnrode,5)
   wlei=space(5)
   select 1
   use spnotif index spnotif
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
         wlei=str(nro,5)
         if wlei >=    wkey
            if wlei <= str(wnroha,5)
               do detalle
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
@04,02 clear to 23,78
close all
RETURN

procedure titulos
set date to dmy
whoja=whoja+1
if whoja>1
   eject
endif
?'CONSEJO PROFESIONAL DE INGENIEROS Y GOLOGOS DE MENDOZA'
?'        Detalle de Notificaciones   ' at 40
??'   Emitido el: ' at 80
??date()
??'  Hoja: '  at 105
??whoja pict '999'
?
?
??'NUMERO'   at  1
??'FECHA'   at 9 
??'Destino ' at 18
??'Expte.Munic. Nro. de Orden ' at 47
??'Municipalidad' at 75
?' Exptes Consejo' at 80
?
wlin=6
return

procedure detalle
?nro    AT 1
??fecha  at 7
wkey1=str(matri,5)+categ
if categ<>'EM'
   SELECT 2
   USE SPMATRI INDEX SPMATRI
   SEEK(WKEY1)
   IF FOUND()
      WKEY2=STR(DCTIPO,1)+STR(DCNRO,8)
      SELECT 3
      USE SPPROF INDEX SPPROF
      SEEK(WKEY2)
      IF FOUND()
         WNOMBRE=NOMBRE
      ELSE
         WNOMBRE=SPACE(30)   
      ENDIF      
   ELSE
      WNOMBRE=SPACE(30)
   ENDIF
ELSE
   SELECT 5
   USE SPMATRIE INDEX SPMATRIE
   SEEK(WKEY1)
   IF FOUND()
      WKEY2=STR(DCTIPO,1)+STR(DCNRO,8)
      SELECT 6
      USE SPPROFE INDEX SPPROFEN
      SEEK(WKEY2)
      IF FOUND()
         WNOMBRE=NOMBRE
      ELSE
         WNOMBRE = SPACE(30)
      ENDIF
   ELSE
      WNOMBRE=SPACE(30)
   ENDIF
ENDIF
select 1   
??WNOMBRE AT 16
??EXPTE   AT 47
??RTRIM(ORDEN) AT 58
??RTRIM(ANTE) AT 75
?RTRIM(EXPTES) AT 80               
wlin=wlin+2
if wlin > 89
   do titulos
endif   
*do movimien     
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
      ?fecha at 26
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
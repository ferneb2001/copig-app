procedure armaemp
set date to ymd
set talk off
clear 
select 1
use cpcompe 
select 2
use spentie
select 3
use spmentie
select 1
go top
wfecha=space(6)
wcuit=space(15)
wcuita=space(11)
wncuit=0
cuenta=0
wumdto=space(8)
wnumdto=0
wdate=date()
wdaten=date()
@10,02 say ' ARMA EMPRESAS CON ENTIDADES'
do while not eof()
@15,01 say nombre
@15,50 say matricula
   if val(a.matricula) > 8999
      select 2
      append blank
      replace dctipo with 8
      wnumdcto = cuenta + 1   
      replace dcnro  with wnumdcto
      CUENTA = CUENTA + 1
      replace nombre with a.nombre
      replace domici with a.domicilio
      replace provin with a.provin
      replace dpto   with a.depart
      replace locali with a.locali
      replace estado with str(a.condi,1)
      replace telef  with str(a.telefono,12)
      replace sexo   with 'M'
      if a.condi > 1
         wfecha=str(a.fecond,6)
         do cambia
         replace fallec with wdaten
      endif
      select 3
      append blank
      replace numero with val(a.matricula)
      replace catego with a.categoria
      replace dctipo with 8
      replace dcnro  with wnumdcto
      replace recibo with a.recibo
      replace condic with str(a.condi,1)
      if a.incr > 0
         wfecha=str(a.incr,6)
         do cambia
         replace inscr  with wdaten
      endif
      if a.pago > 0
         wfecha=str(a.pago,6)
         do cambia
         replace habili with (a.habili + 1900)   
         replace pago with wdaten
      endif
    endif  
    select 1
    skip
*   else 
*      wsigue='n'
*      go bottom
*   endif   
enddo
close all 
return

procedure cambia
wdate=substr(wfecha,1,2)+'/'+substr(wfecha,3,2)+'/';
      +substr(wfecha,5,2)
wdaten=ctod(wdate)
return

procedure pcuit
wcuita=substr(wcuit,2,2)+substr(wcuit,4,8)+substr(wcuit,15,1)
wncuit=val(wcuita)
return      

procedure pnumero
wnumdcto=wnumdcto+1
*wumdcto = substr(wcuit,4,8)
*wnumdcto=val(wumdcto)
return
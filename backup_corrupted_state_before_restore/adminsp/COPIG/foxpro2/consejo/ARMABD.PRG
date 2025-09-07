procedure armabd
set date to ymd
set talk off
select 1
use cpcomp1
select 2
use spprof
select 3
use spmatri
select 1
go top
wfecha=space(6)
wcuit=space(15)
wcuita=space(11)
wncuit=0
wdate=date()
wdaten=date()
do while not eof()
   select 2
   append blank
   replace dctipo with a.dctipo
   replace dcnro  with a.dcnro
   replace nombre with a.nombre
   replace domici with a.domicilio
   replace provin with a.provin
   replace dpto   with a.depart
   replace locali with a.locali
   replace nacion with a.nacion
   replace estado with str(a.condi,1)
   replace telef  with str(a.telefono,12)
   replace sexo   with 'M'
   if a.nacio > 0
      wfecha=str(a.nacio,6)
      do cambia
      replace nacio  with wdaten
   endif
   if a.impgan > 0
      wcuit=str(a.impgan,15)
      do pcuit
      replace cuit with wncuit
   endif
   if a.condi = 2
      wfecha=str(a.fecond,6)
      do cambia
      replace fallec with wdaten
   endif
   select 3
   append blank
   replace numero with val(a.matricula)
   replace catego with a.categoria
   replace dctipo with a.dctipo
   replace dcnro  with a.dcnro
   replace titulo with a.codtit
   replace recibo with a.recibo
   replace afilia with a.afilia
   replace condic with str(a.condi,1)
   if a.incr > 0
      wfecha=str(a.incr,6)
      do cambia
      replace inscr  with wdaten
   endif
   if a.fechtit > 0
      wfecha=str(a.fechtit,6)
      do cambia
      replace fectit  with wdaten
   endif
   if a.pago > 0
      wfecha=str(a.pago,4)+'01'
      do cambia
      replace habili with (a.habili + 1900)   
      replace pago with wdaten
   endif
   select 1
   skip 
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
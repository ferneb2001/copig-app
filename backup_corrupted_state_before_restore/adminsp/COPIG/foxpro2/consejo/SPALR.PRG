PROCEDURE spalr
@23,01 clear to 23,78
wop=1
@23,15 get wop pict '@*H \<Salir; \<Ord. Por Empresa; \<Por Representante Tco.';
       size 1,1 
read
if wop=2
   do spalre
else
   if wop=3
      do noimp
*      do spalrt
   endif
endif                
close all
RETURN

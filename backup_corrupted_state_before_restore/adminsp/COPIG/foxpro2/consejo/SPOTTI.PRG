procedure spotti
PARAMETER WKEY
*actualizacion archivo de otros titulos
wsigue='S'
wmatri=0
wcat=space(2)
wfecha=date()
wkeysa=space(7)
*@18,01 CLEAR TO 23,78
wlin=19
select 5
use sptiaux index sptiaux
do while wsigue='S'
   wlin=19
*   do limpia
*   do ponetit
   select 5
   locate for wkey=str(axnume,5)+axcate
   do while found()
      @10,17 say axtitu 
      @11,17 say axotorg
      @15,33 say axfecti
      @19,33 say axfecce 
      select 6
      use sptitu order titulo
      seek(e.axtitu)
      if found()
         @10,21 say titdesc
      else
         @10,21 say 'Sin Descripcion '
      endif
      select 6
      use spente order codigo
      seek(e.axotorg)
      if found()
         @11,21 say nombre
      else
         @11,21 say 'No existe institucion'
      endif            
      wop=1
      @23,01 clear to 23,78
      @23,22 get wop pict '@*H \<Continuar;\<Modificar;\<Eliminar' size 1,1
      read
      @23,01 clear to 23,78
      if wop=2
         do modisanc
      else
         if wop=3
         	do borrsan
         endif
      endif
      wlin=wlin+1
      if wlin > 23
         do limpia
         wlin=19
      endif   
      @23,01 clear to 23,78
      continue
   enddo
   wop=1
   @23,01 clear to 23,78
   @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
   read
   @23,01 clear to 23,78
   if wop = 2
      do ingrsan
      do limpia
      @23,01 clear to 23,78
   else
     wsigue='N'
   endif
enddo
@23,01 clear to 23,78
close all
return

procedure ingrsan
wconti='s'
do while wconti='s'
   wxtitu=space(3)
   wxotorg=0
   wafecha={  /  /  }
   wbfecha={  /  /  }
   @23,01 say 'Ingrese Titulo'
   @wlin,1 get wxtitu
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @wlin,36 get wxotorg
      @wlin,72 get wafecha
      @22,72 get wbfecha
      read
      append blank
      replace  matric  with wmatri
      replace  catego  with wcat
      replace  axtitu  with wtipo
      replace  axotorg with winc
      replace  axfecti with wnresol
      replace  axfecce with wafecha
      wlin=wlin+1
      if wlin > 19
         do limpia
         wlin=08
      endif  
   else
      wconti = 'n'
   endif
enddo
return

procedure modisanc
   wtipo=axtitu 
   winc=axotorg
   wnresol=axfecti
   wafecha=axfecce
*  wbfecha=sanvigde
   @23,01 say 'Ingrese T¡tulo  ¢ (ESC) p/salir'
   @08,19 get wtipo
   read
   @23,01 clear to 23,78
   if lastkey()<>27
      @wlin,4 get winc
      @wlin,6 get wnresol
      @wlin,12 get wafecha
      read
      replace  axtitu  with wtipo
      replace  axotorg with winc
      replace  axfecti with wnresol
      replace  axfecce with wafecha
   endif
@23,01 clear to 23,78
return

procedure borrsan
delete
return

procedure ponetit
*@18,01 say 'Titulo Descripcion'
*@18,37 say 'Entidad que otorga titulo'
*@18,71 say 'Fech.Tit'
return

procedure limpia
@22,40 clear to 23,78
return


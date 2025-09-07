procedure buscaat
parameter wnumero
*consulta y/o agregado de codigos de actividades
@09,01 clear to 23,78
@09,01 say 'C¢digo  Descripcion         '
@09,49 say '                              '
wsigue='S'
wfecha={  /  /  }
wfechf={  /  /  }
wcpto=space(1)
wmatrt=0
wcatrt=space(2)
wnomrt=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
select 5
use spmacti order empresa
go top
wlin=10
locate for str(empresa,5)=str(wnumero,5)
do while found()
   @wlin,02 say codact
  	  select 6
  	  use spemcac order emactc
  	  seek(str(codact))
  	  if found()
        	 @wlin,11 say emactn
  	  else
   		  @wlin,11 say 'no existe C¢digo en archivo'
   	  endif
   select 5	            
   @wlin,49 say rtinicio
   wop1=1
   @23,20 get wop1 pict '@*H \<Continuar;\<Eliminar' size 1,1
   read
   @23,01 clear to 23,78
   if wop1=2
      delete
   else
   endif
   if wlin<19
      wlin=wlin+1
   else
      @23,01 say 'Oprima cualquier tecla para seguir'
      read
      wlin=10
      @23,01 clear to 23,78
   endif     
   continue   
enddo
*@23,01 say 'fin de la busqueda'
*read
do while wsigue='S'
   wfecha={  /  /  }
   wfechf={  /  /  }
   wmatrt=0
   wcatrt=space(2)
   wnomrt=space(30)
   wkeyrt=space(7)
   wkeyrt1=space(9)
   wvinculo=0
   wperiod=0
   @23,01 say 'Indique Categoria ¢ <ESC> para salir'
   @wlin,02 get wmatrt pict '99999'
   read
   if lastkey()<>27
         select 6
         use spemcac order emactc
         seek(str(wmatrt))
         if found()
               @wlin,11 say emactn
         else
               @wlin,11 say 'No existe Categor¡a en archivo '
         endif
      select 5
      append blank
      replace empresa  with wnumero
      replace codact   with wmatrt
      wlin=wlin+1
   else
      wsigue='N'
   endif
enddo      
close all
@07,01 clear to 23,78
return


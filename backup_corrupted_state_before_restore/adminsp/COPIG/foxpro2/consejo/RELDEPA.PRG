procedure reldepa
parameter wnumero
*consulta y/o agregado de representantes tecnicos
@09,01 clear to 23,78
@09,01 say 'MATRIC  CAT  APELLIDO Y NOMBRE  '
@09,49 say 'F.INICIAL F.FINAL VINCULO PER.'
do vinculo  
wsigue='S'
winicia='S'
wfecha={  /  /  }
wfechf={  /  /  }
wcpto=space(1)
wmatrt=0
wcatrt=space(2)
wnomrt=space(30)
wkeyrt=space(7)
wkeyrt1=space(9)
wlimpia=space(78)
do while winicia='S'
 select 5
 use spreldep order empresa
 go top
 wlin=10
 @03,40 say 'Entidad: '
 @03,60 get wnumero
 read
 if wnumero=99999
 	winicia='N'
 else	
 locate for str(empresa,5)=str(wnumero,5)
 do while found()
   @wlin,02 say matprof
   @wlin,08 say categor
   wkeyrt=str(matprof,5)+categor
   if categor = 'A '   
  	  select 6
  	  use spmatri index spmatri
  	  seek(wkeyrt)
  	  if found()
    	  wkeyrt1=str(dctipo,1)+str(dcnro,8)
     	 select 7
     	 use spprof index spprof
     	 seek(wkeyrt1)
     	 if found()
        	 @wlin,11 say nombre
     	 else
        	 @wlin,11 say 'No Existe Profesional en archivo'
     	 endif
  	  else
   		  @wlin,11 say 'no existe matricula en archivo'
   	  endif
   else	  
  	  select 6
  	  use somatri index somatri
  	  seek(wkeyrt)
  	  if found()
    	  wkeyrt1=str(dctipo,1)+str(dcnro,8)
     	 select 7
     	 use soprof index soprof
     	 seek(wkeyrt1)
     	 if found()
        	 @wlin,11 say nombre
     	 else
        	 @wlin,11 say 'No Existe Profesional en archivo'
     	 endif
  	  else
   		  @wlin,11 say 'no existe matricula en archivo'
   	  endif
   endif	  
   select 5	            
   @wlin,49 say rtinicio
   @wlin,59 say rtfinal
   @wlin,71 say rtvinculo pict '99'
   @wlin,76 say rtperiod  pict '99'
   wop1=1
   @23,20 get wop1 pict '@*H \<Continuar;\<Eliminar;\<Modificar' size 1,1
   read
   @23,01 clear to 23,78
   if wop1=2
      delete
   else
      if wop1=3
         do modirt
      endif      
   endif
   if wlin<19
      wlin=wlin+1
   else
      @23,01 say 'Oprima cualquier tecla para seguir'
      read
      wlin=10
      do while wlin<20
   		@wlin,1 say wlimpia
   		wlin=wlin+1
      enddo
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
   @23,01 say 'Indique Matricula del R.T. ¢ <ESC> para salir'
   @wlin,02 get wmatrt pict '99999'
   read
   if lastkey()<>27
      @wlin,08 get wcatrt pict '!!'
      read
      wkeyrt=str(wmatrt,5)+wcatrt
      if wcatrt = 'A '   
         select 6
         use spmatri index spmatri
         seek(wkeyrt)
         if found()
            wkeyrt1=str(dctipo,1)+str(dcnro,8)
            select 7
            use spprof index spprof
            seek(wkeyrt1)
            if found()
               @wlin,11 say nombre
            else
               @wlin,11 say 'No existe profesional en archivo '
            endif
         else
            @wlin,11 say 'No existe matricula en archivo '
         endif
      else               
         select 6
         use somatri index somatri
         seek(wkeyrt)
         if found()
            wkeyrt1=str(dctipo,1)+str(dcnro,8)
            select 7
            use soprof index soprof
            seek(wkeyrt1)
            if found()
               @wlin,11 say nombre
            else
               @wlin,11 say 'No existe profesional en archivo '
            endif
         else
            @wlin,11 say 'No existe matricula en archivo '
         endif
      endif   
      @wlin,51 get wfecha
      @wlin,61 get wfechf
      @wlin,71 get wvinculo   pict '99'
      @wlin,76 get wperiod    pict '99'
      read
      select 5
      use spreldep index sprelpr
      append blank
      replace empresa  with wnumero
      replace matprof  with wmatrt
      replace categor         with wcatrt
      replace rtinicio        with wfecha
      replace rtfinal         with wfechf
      replace rtvinculo       with wvinculo
      replace rtperiod        with wperiod
      wlin=wlin+1
      select 5
      use spreldep order empresa
   else
      wsigue='N'
   endif
 enddo
 endif
enddo      
close all
@07,01 clear to 23,78
return

procedure modirt
wfecha=rtinicio
wfechf=rtfinal
wvinculo=rtvinculo
wperiod=rtperiod
@23,10 say 'Ingrese datos a modificar'
@wlin,51 get wfecha
@wlin,61 get wfechf
@wlin,71 get wvinculo pict '99'
@wlin,76 get wperiod  pict '99'
read
replace rtinicio  with wfecha
replace rtfinal   with wfechf
replace rtvinculo with wvinculo
replace rtperiod  with wperiod
@23,01 clear to 23,78
return
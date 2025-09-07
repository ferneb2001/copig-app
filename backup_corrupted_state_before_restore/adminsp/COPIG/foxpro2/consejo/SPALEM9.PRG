procedure spalem9
*listado de empresas
* Inscriptas o matriculadas por mes o entre fechas
SET TALK OFF
@04,01 clear to 23,78
@04,28 say 'LISTADO DE EMPRESAS '
select 2
use spprofe index spprofe
select 3
set exclusive on
set safety off
use emtempo
zap
set exclusive off
set date ymd
wfecha=date()
@22,50 say wfecha
wdesde={  /  /  }
whasta=date()
whabi=' '
wop=1
wopcuil=0
wcuen=0
wnomtit=space(30)
@08,02 say 'Par metros'
@10,02 say 'Ingresadas desde:                     (aammdd) '
@13,02 say '           hasta:                     (aammdd) '
@15,02 say ' Imprime cuit 0=si  1=no  '
@11,10 get wdesde
@14,10 get whasta
@15,25 get wopcuil
read
@23,01 clear to 23,78
wcatego='EM'
   wop=1
   wdpto=0
   wnomdpto=space(15)
   @08,60 say 'Departamentos'
   @10,60 get wop pict '@*RVT \<Un departamento;\<Todos' color scheme 4
   read
   if wop=2
      wdpto=0
   else      
      @23,01 say 'Seleccione departamento a listar y oprima <ESC>'
      define window pdpto from 06,30 to 22,50
      activate window pdpto
      select 4
      use spdpto order dpto
      brow in window pdpto
      deactivate window pdpto
      @23,01 clear to 23,78
      wdpto=dpto
      wnomdpto=nombre
   endif
   @23,01 clear to 23,78
   wop=1
   @23,30 get wop pict '@*H \<Salir;\<Imprimir'
   read
   if wop=2                   
      select 1
      use spmatrie
      go top
      set clock on
      @14,21 to 16,57
      @15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
      do while .not. eof()
         sisi=1
         if inscr <>{  /  /  }
            if inscr >= wdesde .and. inscr <= whasta
               sisi=0
            endif
         else   
            if fechab >= wdesde .and. fechab <= whasta
               sisi=0
            endif
         endif   
         if sisi=0          
            do arma
         endif
         select 1
         skip
      enddo
      *@12,01 clear to 12,78       
      @15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
      select 3
      if wdpto = 0
         sort to emtempos on nombre
         do imprime
      else   
         if wdpto<>0 .and. wtitulo='   '
            sort to emtempos on nombre, dpto;
            for dpto=wdpto
            do imprime
         endif
      endif   
endif
@04,01 clear to 23,78
close all
return

procedure imprime
set date dmy
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 1
   use emtempos
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=96
   whoja=0
   wcateg=catego
   wtitu=titulo
   wkey=space(5)
   do while .not. eof()
      select 1      
*      wlin=96
      if wlin > 66
         do titulos
      endif   
      select 6
      use splocal order cod
      seek(a.locali)
      if found()
         wnomlocali=nombre
      else
         wnomlocali=space(15)
      endif
      select 4
      use spdpto order dpto
      seek(a.dpto)
      if found()
         wnomdpto=nombre
      else   
         enomdpto=space(15)
      endif
      wprovc=space(15)
      if str(a.provin,3)<>'  1'
         select 7
         use spprov order prov
         seek(a.provin)
         if found()
            wprovc=nombre
         else
            wprovc=space(15)
         endif
      endif         
      select 1         
      ?numero pict '9999' at 2
      ??catego at 7 
      ??nombre  at 12
      ?? ' '
      if wopcuil = 1
	      ?? cuil at 64
	  endif
      wlin=wlin+1
      wcuen=wcuen+1
      if wlin > 66
         do titulos
      endif
   skip
   enddo
   ?
   ?
   ? 'Total de empresas listadas: '
   ?? wcuen
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
if whoja <> 0
   if wlin > 66
      eject
   endif
endif      
whoja=whoja+1
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'LISTADO DE EMPRESAS   ' AT 25
*?? wcateg at 41
*if whabi='S'
*   ??' (habilitados)' at 61
*else
*   if whabi='N'
*      ??' (no habilitados)' at 61
*   endif      
*endif
?'            Matriculadas entre el '
?? wdesde
?? ' y el '
??whasta   
??'HOJA NRO. ' at 65
??whoja pict '999'
?
? 'MATRIC. CAT.   RAZON SOCIAL     ' 
*?? ' Entidad Otorgante T¡tulo' AT 45
wlin = 5
return


procedure titulosb
?
?wnomtit AT 25
?
wlin=wlin+3
return

procedure arma
@21,30 say pago
wop=0
wnoment=space(30)
if wop=0        
 select 2
 seek(str(a.dctipo,1)+str(a.dcnro,8))
 if found()
      @18,1 say a.numero
      @18,7 say a.catego
      @18,10 say b.nombre
      @18,60 say b.nacio
 *     if dpto = 11 or dpto = 12 
 *           if b.nacio > {31/10/49}
 *           @19,60 say b.nacio
*         select 7
*         use spente order codigo
*         seek(a.otorga)
*         if found()
*         	wnoment=nombre
*         else
         	wnoment=space(30)
*         endif		
         select 3
         append blank
         replace numero with a.numero
         replace catego with a.catego
*         replace titulo with a.titulo
         replace habili with a.habili
         replace condic with a.condic
         replace dctipo with b.dctipo
         replace dcnro  with b.dcnro
         replace nombre with b.nombre
         replace domici with b.domici
         replace provin with b.provin
         replace dpto   with b.dpto
         replace locali with b.locali
         replace telef  with ltrim(b.telef)
*         replace titotorga with wnoment
         replace cuil with b.cuit
         if a.inscr<>{  /  /  }
            replace fecha  with a.inscr
         else
            if a.fechab<>{  /  /  }
               replace fecha with a.fechab
            else   
               replace fecha with a.feccert
            endif   
         endif   
     endif 
endif
*endif
return
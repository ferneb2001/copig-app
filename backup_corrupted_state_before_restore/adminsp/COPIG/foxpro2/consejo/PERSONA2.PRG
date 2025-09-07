procedure persona2  
parameter wkey, wkey2
*actualizacion de datos personales
@07,01 clear to 23,78
@09,01 say 'Dcto.de Identidad:'
@10,01 say 'Domicilio        :'
@11,01 say 'Localidad        :'
@12,01 say 'Dpto/Partido     :'
@13,01 say 'Provincia        :'
@14,01 say 'Fecha de Nacim.  :'
@15,01 say 'Nro.C.U.I.T.     :'
@16,01 say 'Sexo             :'
@17,01 say 'Nacionalidad     :'
@18,01 say 'Telefono         :'
@19,01 say 'Fecha Estado     :'
@20,01 say 'Estado           :'
@22,01 say 'Cursos           :'
select 9
use splocal order cod
seek(str(a.locali,3))
if found()
   wlocalidad=nombre
else
   wlocalidad=space(15)
endif      
select 9
use spdpto order dpto
seek(str(a.dpto,3))
if found()
   wdepartamento=nombre
else
   wdepartamento=space(15)
endif
select 9
use spprov order prov
seek(a.provin)
if found()
   wprovincia=nombre
else
   wprovincia=space(15)
endif            
select 1
@09,21 say dctipo
@09,25 say dcnro
@10,21 say domici
@11,21 say locali
@11,25 say wlocalidad
@12,21 say dpto
@12,25 say wdepartamento
@13,22 say provin pict '99'
@13,25 say wprovincia
@14,21 say nacio
@15,21 say cuit
@16,21 say sexo
@17,21 say nacion
@18,21 say telef
@19,21 say fallec
do case
   case estado='A'
      @20,21 say 'Activo'
   case estado='C'
      @20,21 say 'Carnet Dep.'
   case estado='F'
      @20,21 say 'Fallecido'
   case estado='S'
      @20,21 say 'Suspendido'
   case estado='B'
      @20,21 say 'Baja Matr¡cula'   
endcase            
wsigue='S'
do while wsigue='S'   
   wop=0
   @23,20 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos;<F1> Ayuda';
           size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      @07,01 clear to 23,78
      wsigue='N'
   else
     if wop=2
        do modi
        wsigue='N'
     else
        if wop=3
           do otrosd
        else
           do spay02
        endif      
     endif      
  endif
enddo
@07,01 clear to 23,78   
return

procedure otrosd
wotro=1
@17,54 to 23,77
@17,60 say 'Otros datos'
@18,55 get wotro pict '@* \<Pagos;\<Sanciones;\<Cursos de Post.Grado;\<Salir';
       size 1,1 
read
@15,54 clear to 23,77
if wotro = 1
   save screen to pant01
   do pagos with wkey
   restore screen from pant01
   wsigue='S'
else
   if wotro = 2
      wmatri=val(substr(wkey2,1,5))
      wcateg=substr(wkey2,6,2)
      do buscasan with wmatri, wcateg
   else
     if wotro = 3
        do cursos with wkey2
     endif
  endif
endif                  
return

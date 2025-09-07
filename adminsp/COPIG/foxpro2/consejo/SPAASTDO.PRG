procedure spaastdo
* Actualizacion archivo de Empresas del Estado
set talk off
wsigue='S'
wnumero=0
set exclusive off
*set multilocks on
wcatego=space(2)
wnom=space(55)
wtit=0
wfincr={  /  /  }
wftit={  /  /  }
wpago={  /  /  }
wfecb=0
wfeccert={  /  /  }
wkey=space(7)
select 1
use sppstdo index sppstde.idx, sppstden.idx, sppstdec.idx 
select 2
use spmstdo index spmstdie, spmstdoe
@04,01 clear to 23,78
@06,02 say 'Matricula'
@06,20 say 'Categ.:'
@04,25 say 'ACTUALIZACION DE EMPRESAS DEL ESTADO'
do while wsigue='S'
   @05,01 clear to 23,78
   @06,02 say 'Matricula'
   @06,20 say 'Categ.:'
   do pant01
   select 1
   use sppstdo index sppstde.idx, sppstden.idx, sppstdec.idx 
   select 2
   use spmstdo index spmstdie, spmstdoe
   wnumero=0
   @23,01 say 'Indique el nro.de matricula o <ESC> para salir'
   @06,13 get wnumero pict '99999'
   read
   @23,01 clear to 23,78
   if lastkey()<> 27
      wcatego='EM'
      if wcatego = 'EM'
      wkey=str(wnumero,5)+wcatego
      select 2
      seek(wkey)
      if found()
         wkey1=str(dctipo,1)+str(dcnro,8)
         select 1
         seek(wkey1)
         if found()
            do pant01
            @ 07,20 say nombre
             select 2
             @10,17 say b.inscr
             @14,17 say b.pago
             @16,17 say b.habili
             wfecbh=b.habili
             if b.condic='A' or b.condic='1'
             	westado='Activa'
             else
				if b.condic='B' or b.condic='5'
      				westado='Baja solicit.x Empresa'
      			else
      				if b.condic='C' or b.condic='2'
      					westado='Comunic¢ Inactividad'
      				else
      					if b.condic='F' or b.condic='3'
      						westado='Baja por Consejo'
      					else
      						if b.condic='S' or b.condic='4'
      							westado='Suspendida'
      						else
      								westado= ' otro'+b.condic
      						endif
      					endif
      				endif        	
             	endif	
             endif
             @21,17 say westado
             do buscsana
             select 2
             wop=2
             do while wop<>1
                @23,25 get wop picture '@*H \<Salir;\<Modificar;\<Otros Datos';
                       size 1,1 
                read
                @23,01 clear to 23,78
                if wop=2
                   do modifica1
                else
                   if wop=3
                      do otros
                      wop=3
                   endif
                endif         
                @23,01 clear to 23,78
             enddo       
         else
            @06,60 SAY 'SIN DATOS PERSONALES'
         endif      
      else
         *@06,60 say 'No encontro'
         DO INGRSTEM with wnumero, wcatego
      endif
      else
         @23,01 say 'mal numero de matricula'
      endif   
   else
      wsigue='N'
   endif
enddo
close all
@04,01 clear to 23,78
return

procedure pant01
@ 08,01 clear to 23,78
@10,02 say 'Fecha Matric:'
@14,02 say 'Fecha Pago  :'
@16,02 say 'A¤o de Habil:'
@20,02 say 'Cod.Inscrip.:'
@21,02 say 'Estado      :'

return

procedure modifica1
wnom=a.nombre
*wtit=b.titulo
wfincr=b.inscr
*wftit=b.fectit
westcon=b.condic
wpago=b.pago
wfecb=b.habili
@07,20 get wnom
@10,17 get wfincr
*@12,17 get wftit
@14,17 get wpago
@16,17 get wfecb
@21,17 get westcon
read
replace a.nombre  with wnom
*replace b.titulo  with wtit
replace b.inscr   with wfincr
*replace b.fectit  with wftit
replace b.pago    with wpago
replace b.habili  with wfecb
replace b.condic  with westcon
*replace b.feccert with wfeccert
@23,01 clear to 23,78
return

procedure otros
wotro=0
@17,54 to 23,77
@17,60 say 'Otros datos'
@18,55 get wotro picture '@* \<Datos Personales;\<Pagos;\<Sanciones;\<Rep.Tcos;\<Observaciones;\<Salir';
                          size 1,1
read
@17,54 clear to 23,78
do case
   case wotro = 1
      do persstel with wkey
   case wotro = 2
      do pagos with wkey
   case wotro = 3
      do sanciones
   case wotro = 4
      do buscart with wnumero
   case wotro = 5
   	  do spobsere with wkey, wkey1   
endcase   
return

procedure sanciones
do buscasen with wnumero, wcatego
return

procedure buscsana
wop99=0
select 8
use sprestri index sprestri
locate for wkey=str(matric,5)+catego
do while found()
	if restrotr < 1
		wop99=1
	endif
	continue
if wop99<>0
	@9,50 say 'Existe Restriccion ' color r/w*
endif	
enddo
return

